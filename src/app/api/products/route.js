import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).optional()
});

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");

  const filter = {};
  if (channel === "shop" || channel === "library") filter.channel = channel;

  const products = await Product.find(filter).sort({ createdAt: -1 });
  return NextResponse.json({ ok: true, products });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();

  // Attention: price peut arriver en string depuis un form => conversion dans l'UI
  const data = ProductSchema.parse(body);

  const created = await Product.create({
    ...data,
    productType: data.productType || "physical"
  });

  return NextResponse.json({ ok: true, product: created }, { status: 201 });
}