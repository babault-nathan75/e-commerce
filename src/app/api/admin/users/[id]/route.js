import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import sanitize from 'mongo-sanitize';

const PatchSchema = z.object({
  isAdmin: z.boolean()
});

export async function PATCH(req, context) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const cleanBody = sanitize(body);
  const data = PatchSchema.parse(cleanBody);

  await connectDB();

  if (id === session.user.id && data.isAdmin === false) {
    return NextResponse.json(
      { error: "Impossible de retirer tes propres droits admin" },
      { status: 400 }
    );
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isAdmin: data.isAdmin },
    { new: true }
  ).select("name email isAdmin");

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user });
}


export async function DELETE(_req, context) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Impossible de supprimer ton propre compte admin" },
      { status: 400 }
    );
  }

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
