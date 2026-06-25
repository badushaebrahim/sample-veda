import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";

// GET /api/users/profile - Fetch the logged-in user's profile details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const currentUser = session.user as any;
    const user = await User.findById(currentUser.id, "name email role address");
    
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Update the logged-in user's profile address or name
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const currentUser = session.user as any;
    const { name, address } = await req.json();

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (address) {
      updateFields.address = {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      { $set: updateFields },
      { new: true, select: "name email role address" }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
