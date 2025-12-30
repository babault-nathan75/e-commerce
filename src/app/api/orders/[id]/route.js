import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const nextStatusMap = {
  EFFECTUER: "EN_COURS_DE_LIVRAISON",
  EN_COURS_DE_LIVRAISON: "LIVRER",
  LIVRER: "LIVRER"
};

export async function GET(_req, context) {
  const { id } = await context.params; // ✅ CORRECTION NEXT.JS 16

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = !!session.user.isAdmin;
  const isOwner = order.userId && order.userId.toString() === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, order });
}

export async function PATCH(req, context) {
  const { id } = await context.params; // ✅ CORRECTION NEXT.JS 16

  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const requested = body.status;

  if (!["EFFECTUER", "EN_COURS_DE_LIVRAISON", "LIVRER"].includes(requested)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  await connectDB();

  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.canceledAt) {
    return NextResponse.json(
      { error: "Commande annulée: statut non modifiable" },
      { status: 400 }
    );
  }

  const allowedNext = nextStatusMap[order.status];
  if (requested !== allowedNext) {
    return NextResponse.json(
      { error: `Transition invalide. Prochain statut autorisé: ${allowedNext}` },
      { status: 400 }
    );
  }

  order.status = requested;
  await order.save();

  return NextResponse.json({ ok: true, order });
}
