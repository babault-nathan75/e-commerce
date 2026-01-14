import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sanitize from 'mongo-sanitize';


const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  channel: z.enum(["shop", "library"]).optional(),
  productType: z.enum(["physical", "digital"]).optional(),
  category: z.array(z.string()).optional(),
  stock: z.number().min(0).optional() // ✅ AJOUT CRUCIAL
});



export async function GET(_req, context) {
  await connectDB();

  const { id } = await context.params; // ✅ OBLIGATOIRE (Next 15+)

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product });
}



export async function PUT(req, context) {
  try {
    const { id } = await context.params; // ✅ ICI AUSSI

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const body = sanitize(await req.json());
    const data = UpdateSchema.parse(body);

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 🔥 GESTION INTELLIGENTE DU STOCK
    if (typeof data.stock === "number") {
      const diff = data.stock - product.stockAvailable;
      product.stockAvailable += diff;
      delete data.stock;
    }

    Object.assign(product, data);
    await product.save();

    return NextResponse.json({ ok: true, product });

  } catch (err) {
    console.error("PUT PRODUCT ERROR:", err);

    return NextResponse.json(
      {
        error: "Invalid request",
        details: err?.errors || err?.message
      },
      { status: 400 }
    );
  }
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