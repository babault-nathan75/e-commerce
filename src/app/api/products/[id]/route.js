import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  channel: z.enum(["shop", "library"]).optional(),
  productType: z.enum(["physical", "digital"]).optional()
});

export async function GET(_req, { params }) {
  await connectDB();
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, product });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const data = UpdateSchema.parse(body);

  const updated = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}