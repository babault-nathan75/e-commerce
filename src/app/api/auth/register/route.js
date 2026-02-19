import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import sanitize from 'mongo-sanitize';

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  address: z.string().optional(),
  password: z.string().min(6),
  phone: z.string().optional()
});

export async function POST(req) {
  try {
    const body = await req.json();
    const cleanBody = sanitize(body);
    const data = RegisterSchema.parse(cleanBody);

    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await User.create({
      name: data.name,
      email: data.email,
      address: data.address,
      phone: data.phone || "",
      passwordHash,
      isAdmin: false
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}