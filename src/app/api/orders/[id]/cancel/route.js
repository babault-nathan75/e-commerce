import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sanitize from 'mongo-sanitize';

const CancelSchema = z.object({
  cancelReason: z.string().min(5)
});

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cleanBody = sanitize(body);
  const data = CancelSchema.parse(cleanBody);

  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = !!session.user.isAdmin;
  const isOwner = order.userId && order.userId.toString() === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status === "LIVRER") {
    return NextResponse.json({ error: "Impossible d'annuler une commande livrée" }, { status: 400 });
  }

  if (order.canceledAt) {
    return NextResponse.json({ error: "Commande déjà annulée" }, { status: 400 });
  }

  order.cancelReason = data.cancelReason.trim();
  order.canceledAt = new Date();
  order.canceledBy = isAdmin ? "ADMIN" : "USER";
  await order.save();

  return NextResponse.json({ ok: true });
}