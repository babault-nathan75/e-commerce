import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const orderCode = (searchParams.get("orderCode") || "").trim();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (!orderCode || !email) {
    return NextResponse.json({ error: "orderCode et email requis" }, { status: 400 });
  }

  const order = await Order.findOne({
    orderCode,
    "guest.email": email
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({
  ok: true,
  order: {
    orderCode: order.orderCode,
    status: order.status,
    items: order.items,
    totalItems: order.totalItems,
    totalPrice: order.totalPrice,
    name: order.guest?.name || "",
    email: order.guest?.email || "",
    contact: order.guest?.phone || order.contactPhone || "",
    deliveryAddress: order.guest?.deliveryAddress || order.deliveryAddress || "",
    createdAt: order.createdAt,

    // ajout :
    canceledAt: order.canceledAt,
    cancelReason: order.cancelReason
  }
});
}