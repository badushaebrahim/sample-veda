import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// GET /api/orders - Fetch orders (authenticated users)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const user = session.user as any;
    let orders;

    if (user.role === "customer") {
      // Customer fetches only their own orders
      orders = await Order.find({ customer: user.id })
        .sort({ createdAt: -1 });
    } else {
      // Factory/Admin fetches all orders and populates customer details
      orders = await Order.find()
        .populate("customer", "name email")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
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
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
