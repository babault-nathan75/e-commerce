import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const CreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(2)
});

export async function GET(_req, { params }) {
  await connectDB();

  const reviews = await Review.find({ productId: params.id }).sort({ createdAt: -1 });

  // On enrichit avec infos user (sans surcharger)
  const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } }).select("name");
  const map = new Map(users.map((u) => [u._id.toString(), u.name]));

  const payload = reviews.map((r) => ({
    _id: r._id.toString(),
    productId: r.productId.toString(),
    userId: r.userId.toString(),
    userName: map.get(r.userId.toString()) || "User",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  }));

  return NextResponse.json({ ok: true, reviews: payload });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = CreateSchema.parse(body);

  await connectDB();

  // (Optionnel) empêcher plusieurs reviews du même user sur le même produit :
  const exists = await Review.findOne({ productId: params.id, userId: session.user.id });
  if (exists) {
    return NextResponse.json({ error: "Tu as déjà noté/commenté ce produit." }, { status: 409 });
  }

  const created = await Review.create({
    productId: params.id,
    userId: session.user.id,
    rating: data.rating,
    comment: data.comment
  });

  return NextResponse.json({ ok: true, reviewId: created._id.toString() }, { status: 201 });
}