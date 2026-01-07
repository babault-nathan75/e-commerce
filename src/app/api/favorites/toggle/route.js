import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import sanitize from 'mongo-sanitize';

const ToggleSchema = z.object({
  productId: z.string().min(1)
});

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cleanBody = sanitize(body);
  const data = ToggleSchema.parse(cleanBody);

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const pid = data.productId;
  const exists = (user.favorites || []).some((id) => id.toString() === pid);

  if (exists) {
    user.favorites = user.favorites.filter((id) => id.toString() !== pid);
  } else {
    user.favorites.push(pid);
  }

  await user.save();

  return NextResponse.json({ ok: true, isFavorite: !exists });
}