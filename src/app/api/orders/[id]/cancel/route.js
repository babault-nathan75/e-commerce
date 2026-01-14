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
  const { id } = params;
  await connectDB();

  const session = await getServerSession(authOptions);
  const body = sanitize(await req.json().catch(() => ({})));

  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.canceledAt) {
    return NextResponse.json({ error: "Déjà annulée" }, { status: 400 });
  }

  const canceledBy = session?.user?.isAdmin ? "ADMIN" : "USER";

  /* 🔁 RESTITUTION DU STOCK */
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product?.isLimited) {
      product.stockAvailable += item.quantity;
      await product.save();
    }
  }
  if (order.status === "EFFECTUER") {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stockAvailable: item.quantity } }
    );
  }

  order.status = "ANNULEE";
  order.canceledAt = new Date();
  await order.save();
}


  order.status = "ANNULEE";
  order.canceledAt = new Date();
  order.canceledBy = canceledBy;
  order.cancelReason = body.reason || null;

  await order.save();

  return NextResponse.json({ ok: true });
}
