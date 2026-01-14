import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sanitize from 'mongo-sanitize';

// 1. Mise à jour du schéma de validation pour inclure le STOCK
const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  stock: z.number().min(0).default(0), // 👈 Ajouté ici
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([])
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
  
  // Vérification de sécurité
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit : Accès Admin requis" }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const cleanBody = sanitize(body);

    // 2. Conversion des types avant la validation Zod
    // Le FormData envoie souvent des strings, on les convertit en nombres
    const preparedData = {
      ...cleanBody,
      price: Number(cleanBody.price),
      stock: Number(cleanBody.stock) || 0,
    };

    // 3. Validation avec Zod
    const validatedData = ProductSchema.parse(preparedData);

    // 4. Une seule création en base de données
    const newProduct = await Product.create(validatedData);

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("Erreur API:", error);
    
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Erreur lors de la création de l'article" }, { status: 500 });
  }
}