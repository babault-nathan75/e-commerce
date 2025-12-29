import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(_req, context) {
  const { id } = await context.params; // ✅ OBLIGATOIRE en Next.js 16

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = !!session.user.isAdmin;
  const isOwner = review.userId.toString() === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Review.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
