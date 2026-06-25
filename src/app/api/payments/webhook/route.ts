import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

// POST /api/payments/webhook - Secure webhook listener for Razorpay payment status sync
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing Razorpay signature header" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!secret) {
      return NextResponse.json({ success: false, error: "Razorpay webhook secret is not configured" }, { status: 500 });
    }
    
    // Cryptographically verify the webhook payload authenticity
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(rawBody);
    const expectedSignature = shasum.digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature verification" }, { status: 403 });
    }

    const eventData = JSON.parse(rawBody);
    const event = eventData.event;

    // Handle payment capture events
    if (event === "payment.captured" || event === "order.paid") {
      await dbConnect();
      
      const paymentEntity = eventData.payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ success: false, error: "Order ID missing in webhook payload" }, { status: 400 });
      }

      // Find order matching the Razorpay Order ID
      const order = await Order.findOne({ razorpayOrderId });
      
      if (!order) {
        return NextResponse.json({ success: false, error: `Order not found for rzpOrderId: ${razorpayOrderId}` }, { status: 404 });
      }

      // If already paid, acknowledge to avoid re-processing
      if (order.paymentStatus === "paid") {
        return NextResponse.json({ success: true, message: "Order already updated as paid" }, { status: 200 });
      }

      // Mark order as paid
      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();

      // Decrement inventory stock levels atomically for each ordered product
      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
      }

      return NextResponse.json({ success: true, message: "Payment processed and inventory decremented successfully" }, { status: 200 });
    }

    // Acknowledge other unhandled events to prevent webhook retries
    return NextResponse.json({ success: true, message: "Event ignored" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
