import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// POST /api/payments/verify - Instantly verify Razorpay signature on client checkout
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay payment details" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Razorpay credentials are not configured" },
        { status: 500 }
      );
    }

    // Verify signature: HMAC-SHA256 of "razorpay_order_id|razorpay_payment_id"
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order matching Razorpay ID ${razorpayOrderId} not found` },
        { status: 404 }
      );
    }

    // If order is already paid, acknowledge
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, data: order, message: "Order is already paid" }, { status: 200 });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Decrement stock levels atomically
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify signature" },
      { status: 500 }
    );
  }
}
