import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: "customer" | "factory" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["customer", "factory", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times
export const User = models.User || model<IUser>("User", UserSchema);
