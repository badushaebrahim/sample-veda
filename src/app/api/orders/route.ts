import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// GET /api/orders - Fetch orders (authenticated users with optional cursor pagination)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const shippingStatus = searchParams.get("shippingStatus");
    const paymentStatus = searchParams.get("paymentStatus");

    const query: any = {};

    // Customer security filter
    if (user.role === "customer") {
      query.customer = user.id;
    }

    // Shipping status filter
    if (shippingStatus) {
      query.shippingStatus = shippingStatus;
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Search filter
    if (search) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      if (isObjectId) {
        query._id = search;
      } else {
        // Query users collection first for matches on name/email
        const User = (await import("@/models/User")).User;
        const matchingUsers = await User.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }).select("_id");
        const userIds = matchingUsers.map(u => u._id);

        query.$or = [
          { customer: { $in: userIds } },
          { "products.name": { $regex: search, $options: "i" } }
        ];
      }
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (cursor) {
        query._id = { $lt: cursor };
      }

      const orders = await Order.find(query)
        .populate("customer", "name email")
        .sort({ _id: -1 })
        .limit(limit + 1);

      const hasNextPage = orders.length > limit;
      const results = hasNextPage ? orders.slice(0, limit) : orders;
      const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

      return NextResponse.json({
        success: true,
        data: results,
        nextCursor,
        hasNextPage
      }, { status: 200 });
    } else {
      const orders = await Order.find(query)
        .populate("customer", "name email")
        .sort({ createdAt: -1 });

      return NextResponse.json({ success: true, data: orders }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Place a pending order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const user = session.user as any;
    const body = await req.json();
    const { items, shippingAddress } = body; // items: Array of { productId, quantity }

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ success: false, error: "Missing items or address details" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Verify stock and snapshot prices
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for product: ${dbProduct.name}. Available: ${dbProduct.stockQuantity}` },
          { status: 400 }
        );
      }

      totalAmount += dbProduct.price * item.quantity;
      
      orderProducts.push({
        product: dbProduct._id,
        name: dbProduct.name,
        priceAtPurchase: dbProduct.price,
        quantity: item.quantity,
      });
    }

    // Create order document
    const newOrder = await Order.create({
      customer: user.id,
      products: orderProducts,
      totalAmount,
      paymentStatus: "pending",
      shippingStatus: "pending",
      shippingAddress,
      statusHistory: [{
        status: "pending",
        updatedBy: user.id,
        updatedByName: user.name || user.email || "Customer",
        updatedByEmail: user.email,
        note: "Order created successfully. Pending facility confirmation.",
        timestamp: new Date()
      }]
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
