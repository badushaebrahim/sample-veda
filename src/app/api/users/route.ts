import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";

// GET /api/users - Fetch all users (Admins only, with optional cursor pagination)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const currentUser = session.user as any;
    if (currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admins only" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const query: any = {};

    if (role && role !== "All") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (cursor) {
        query._id = { $lt: cursor };
      }

      const users = await User.find(query, "name email role createdAt")
        .sort({ _id: -1 })
        .limit(limit + 1);

      const hasNextPage = users.length > limit;
      const results = hasNextPage ? users.slice(0, limit) : users;
      const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

      return NextResponse.json({
        success: true,
        data: results,
        nextCursor,
        hasNextPage
      }, { status: 200 });
    } else {
      const users = await User.find(query, "name email role createdAt").sort({ name: 1 });
      return NextResponse.json({ success: true, data: users }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update a user's role (Admins only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const currentUser = session.user as any;
    if (currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ success: false, error: "Missing userId or role" }, { status: 400 });
    }

    const validRoles = ["customer", "factory", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role value" }, { status: 400 });
    }

    await dbConnect();

    // Prevent admin from accidentally changing their own role (optional safety check)
    if (currentUser.id === userId && role !== "admin") {
      return NextResponse.json({ success: false, error: "Cannot change your own admin role" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
