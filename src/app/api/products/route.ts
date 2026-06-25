import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// GET /api/products - List products (public access with optional cursor pagination)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const status = searchParams.get("status"); // 'instock' | 'outofstock'

    const query: any = {};
    
    if (category && category !== "All") {
      query.categories = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "instock") {
      query.stockQuantity = { $gt: 0 };
    } else if (status === "outofstock") {
      query.stockQuantity = { $lte: 0 };
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (cursor) {
        query._id = { $lt: cursor };
      }

      let products = await Product.find(query).sort({ _id: -1 }).limit(limit + 1);

      // Auto-seed if database is empty
      if (products.length === 0 && !category && !search && !cursor) {
        const count = await Product.countDocuments();
        if (count === 0) {
          const { PRODUCTS } = require("@/lib/products");
          const productsToSeed = PRODUCTS.map((p: any) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            stockQuantity: p.stockQuantity,
            categories: p.categories,
            imageUrls: p.imageUrls,
            metadata: p.metadata,
          }));
          await Product.insertMany(productsToSeed);
          products = await Product.find(query).sort({ _id: -1 }).limit(limit + 1);
        }
      }

      const hasNextPage = products.length > limit;
      const results = hasNextPage ? products.slice(0, limit) : products;
      const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

      return NextResponse.json({
        success: true,
        data: results,
        nextCursor,
        hasNextPage
      }, { status: 200 });
    } else {
      let products = await Product.find(query).sort({ createdAt: -1 });

      // Auto-seed if database is empty
      if (products.length === 0 && !category && !search) {
        const count = await Product.countDocuments();
        if (count === 0) {
          const { PRODUCTS } = require("@/lib/products");
          const productsToSeed = PRODUCTS.map((p: any) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            stockQuantity: p.stockQuantity,
            categories: p.categories,
            imageUrls: p.imageUrls,
            metadata: p.metadata,
          }));
          await Product.insertMany(productsToSeed);
          products = await Product.find(query).sort({ createdAt: -1 });
        }
      }

      return NextResponse.json({ success: true, data: products }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (Admin or Factory)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Login required." },
        { status: 401 }
      );
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "factory") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin or Factory role required." },
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
