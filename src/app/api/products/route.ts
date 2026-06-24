import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// GET /api/products - List products (public access)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: any = {};
    
    if (category) {
      query.categories = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin role required." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const { name, description, price, stockQuantity, categories, imageUrls, metadata } = body;

    if (!name || !description || price === undefined || stockQuantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required product details" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      categories: categories || [],
      imageUrls: imageUrls || [],
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
