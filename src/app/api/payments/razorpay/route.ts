import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Razorpay from "razorpay";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { authOptions } from "@/lib/auth";

// POST /api/payments/razorpay - Initiate a Razorpay payment order
export async function POST(req: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || "";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!key_id || !key_secret) {
      return NextResponse.json({ success: false, error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify order is still pending payment
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: false, error: "Order has already been paid" }, { status: 400 });
    }

    // Create Razorpay Order
    // Amount is in the smallest currency unit (paise for INR). E.g. 1 INR = 100 Paise
    const amountInPaise = Math.round(order.totalAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        customerId: (session.user as any).id,
        orderId: order._id.toString(),
      },
    });

    // Save Razorpay Order ID to database
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    return NextResponse.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      rzpOrderId: rzpOrder.id,
      receipt: rzpOrder.receipt,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
