import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string; // Snapshotted name in case product changes
  priceAtPurchase: number; // Snapshotted price
  quantity: number;
}

export interface IOrder {
  customer: Types.ObjectId;
  products: IOrderItem[];
  totalAmount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingStatus: "pending" | "processing" | "shipped" | "delivered";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    shippingStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
      index: true,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
