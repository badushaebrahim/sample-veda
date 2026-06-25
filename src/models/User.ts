import mongoose, { Schema, model, models } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: "customer" | "factory" | "admin";
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zipCode: { type: String, default: "" },
  country: { type: String, default: "" },
}, { _id: false });

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
    address: {
      type: AddressSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times
export const User = models.User || model<IUser>("User", UserSchema);
