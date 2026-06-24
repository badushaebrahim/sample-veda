import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { authOptions } from "@/lib/auth";

// GET /api/orders/[id] - Fetch single order details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const order = await Order.findById(id).populate("customer", "name email");

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const user = session.user as any;
    // Customer can only view their own order
    if (user.role === "customer" && order.customer._id.toString() !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update shipping status (Admin or Factory)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "admin" && user.role !== "factory") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { shippingStatus } = body;

    if (!shippingStatus) {
      return NextResponse.json({ success: false, error: "shippingStatus field is required" }, { status: 400 });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered"];
    if (!validStatuses.includes(shippingStatus)) {
      return NextResponse.json({ success: false, error: "Invalid shippingStatus value" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    order.shippingStatus = shippingStatus;
    await order.save();

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
