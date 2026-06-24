import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";

// GET /api/users - Fetch all users (Admins only)
export async function GET() {
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
    const users = await User.find({}, "name email role createdAt").sort({ name: 1 });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
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
