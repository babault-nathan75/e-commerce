import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const now = new Date();
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  /* ---------------- 1. STATISTIQUES GLOBALES ---------------- */
  const [usersWeek, usersMonth, usersYear] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ createdAt: { $gte: startOfYear } }),
  ]);

  const [ordersDay, ordersWeek, ordersMonth, ordersYear] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfYear } }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: "LIVRER" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  /* ---------------- 2. CHARTS : LOGIQUE DE REMPLISSAGE (PERFECTION) ---------------- */
  
  // Générer les 7 derniers jours pour garantir des données continues
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    last7Days.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
  }

  // REVENUS & INSCRIPTIONS (7 DERNIERS JOURS)
  const dailyStats = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfWeek }, status: "LIVRER" } },
    {
      $group: {
        _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    }
  ]);

  const usersDaily = await User.aggregate([
    { $match: { createdAt: { $gte: startOfWeek } } },
    {
      $group: {
        _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  // COMMANDES PAR MOIS (ANNÉE EN COURS)
  const ordersMonthlyAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfYear } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Mapping des mois pour la beauté des labels
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  /* ---------------- 3. ASSEMBLAGE FINAL ---------------- */

  return NextResponse.json({
    users: { week: usersWeek, month: usersMonth, year: usersYear },
    orders: { day: ordersDay, week: ordersWeek, month: ordersMonth, year: ordersYear },
    revenue: totalRevenue,
    charts: {
      // Inscriptions : Mapping pour boucher les trous avec 0
      users: last7Days.map(date => ({
        label: date,
        value: usersDaily.find(u => u._id === date)?.count || 0
      })),
      
      // Revenus : Nouveau graphique pour la trésorerie
      revenue: last7Days.map(date => ({
        label: date,
        value: dailyStats.find(s => s._id === date)?.revenue || 0
      })),

      // Commandes : Utilisation des noms de mois
      orders: ordersMonthlyAgg.map(o => ({
        label: monthNames[o._id - 1],
        value: o.count
      }))
    }
  });
}