import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const Schema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = Schema.parse(body);

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await bcrypt.compare(data.oldPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Ancien mot de passe incorrect" }, { status: 400 });

  user.passwordHash = await bcrypt.hash(data.newPassword, 10);
  await user.save();

  return NextResponse.json({ ok: true });
}