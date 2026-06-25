import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { authOptions } from "@/lib/auth";

// GET /api/metrics/historic
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Grouping pipeline to aggregate revenue and order volume by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline: any[] = [
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          ordersCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort ascending by date
      }
    ];

    const aggregatedData = await Order.aggregate(pipeline);

    return NextResponse.json({ success: true, data: aggregatedData }, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch historic metrics" },
      { status: 500 }
    );
  }
}
