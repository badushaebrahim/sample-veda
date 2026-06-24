import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { authOptions } from "@/lib/auth";

// GET /api/products/[id] - Fetch single product (public)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin or Factory)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userRole = (session.user as any).role;
    
    if (userRole !== "admin" && userRole !== "factory") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin or Factory role required." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Role-based update permission checks
    if (userRole === "factory") {
      // Factory user can only update stock quantity
      if (body.name !== undefined || body.description !== undefined || body.price !== undefined || body.categories !== undefined || body.imageUrls !== undefined) {
        return NextResponse.json(
          { success: false, error: "Factory users are restricted to modifying stock levels only." },
          { status: 403 }
        );
      }
      if (body.stockQuantity === undefined) {
        return NextResponse.json({ success: false, error: "stockQuantity field is required" }, { status: 400 });
      }
      product.stockQuantity = body.stockQuantity;
    } else {
      // Admin user can update everything
      if (body.name !== undefined) product.name = body.name;
      if (body.description !== undefined) product.description = body.description;
      if (body.price !== undefined) product.price = body.price;
      if (body.stockQuantity !== undefined) product.stockQuantity = body.stockQuantity;
      if (body.categories !== undefined) product.categories = body.categories;
      if (body.imageUrls !== undefined) product.imageUrls = body.imageUrls;
      if (body.metadata !== undefined) product.metadata = body.metadata;
    }

    await product.save();
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await dbConnect();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
