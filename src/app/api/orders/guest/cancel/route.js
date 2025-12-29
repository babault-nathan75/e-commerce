import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

const CancelSchema = z.object({
  orderCode: z.string().min(3),
  email: z.string().email(),
  cancelReason: z.string().min(5)
});

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const data = CancelSchema.parse(body);

  const order = await Order.findOne({
    orderCode: data.orderCode.trim(),
    "guest.email": data.email.trim().toLowerCase()
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (order.status === "LIVRER") {
    return NextResponse.json({ error: "Impossible d'annuler une commande livrée" }, { status: 400 });
  }

  if (order.canceledAt) {
    return NextResponse.json({ error: "Commande déjà annulée" }, { status: 400 });
  }

  order.cancelReason = data.cancelReason.trim();
  order.canceledAt = new Date();
  order.canceledBy = "USER";
  await order.save();

  return NextResponse.json({ ok: true });
}