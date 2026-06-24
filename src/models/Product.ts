import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categories: string[];
  imageUrls: string[];
  metadata: {
    ingredients?: string[];
    dosage?: string;
    benefits?: string[];
    size?: string; // e.g. "100g", "250ml"
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    metadata: {
      ingredients: { type: [String], default: [] },
      dosage: { type: String, default: "" },
      benefits: { type: [String], default: [] },
      size: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export const Product = models.Product || model<IProduct>("Product", ProductSchema);
