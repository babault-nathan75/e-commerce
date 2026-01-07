import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sanitize from 'mongo-sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  /* ---------------- USERS ---------------- */
  const usersWeek = await User.countDocuments({
    createdAt: { $gte: startOfWeek }
  });

  const usersMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  const usersYear = await User.countDocuments({
    createdAt: { $gte: startOfYear }
  });

  /* ---------------- ORDERS ---------------- */
  const ordersDay = await Order.countDocuments({
    createdAt: {
      $gte: new Date(now.setHours(0, 0, 0, 0))
    }
  });

  const ordersWeek = await Order.countDocuments({
    createdAt: { $gte: startOfWeek }
  });

  const ordersMonth = await Order.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  const ordersYear = await Order.countDocuments({
    createdAt: { $gte: startOfYear }
  });

  /* ---------------- REVENUE (LIVRÉES) ---------------- */
  const revenueAgg = await Order.aggregate([
    {
      $match: {
        status: "LIVRER"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" }
      }
    }
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  /* ---------------- CHARTS ---------------- */

  // Inscriptions par jour (7 derniers jours)
  const usersChart = await User.aggregate([
    {
      $match: { createdAt: { $gte: startOfWeek } }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%d/%m", date: "$createdAt" }
        },
        value: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Commandes par mois (année en cours)
  const ordersChart = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startOfYear } }
    },
    {
      $group: {
        _id: {
          $month: "$createdAt"
        },
        value: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return NextResponse.json({
    users: { week: usersWeek, month: usersMonth, year: usersYear },
    orders: { day: ordersDay, week: ordersWeek, month: ordersMonth, year: ordersYear },
    revenue,
    charts: {
      users: usersChart.map((u) => ({ label: u._id, value: u.value })),
      orders: ordersChart.map((o) => ({
        label: `M${o._id}`,
        value: o.value
      }))
    }
  });
}
