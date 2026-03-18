import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Configuration Cloudinary (à placer dans vos variables d'environnement)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).default(0),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
});

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Accès Admin requis" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image"); // Récupère le fichier binaire

    if (!imageFile) {
      return NextResponse.json({ error: "L'image est manquante" }, { status: 400 });
    }

    // 1. Conversion du fichier en Buffer pour Cloudinary
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload vers Cloudinary via un Promise
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "votre_dossier_produits" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 3. Validation des données textuelles
    const rawData = {
      name: formData.get("name"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      description: formData.get("description"),
      channel: formData.get("channel"),
      productType: formData.get("productType"),
      // On parse la catégorie car elle arrive souvent sous forme de string JSON via FormData
      category: formData.get("category") ? JSON.parse(formData.get("category")) : [],
    };

    const validatedData = ProductSchema.parse(rawData);

    // 4. Sauvegarde en Base de données
    await connectDB();
    const newProduct = await Product.create({
      ...validatedData,
      imageUrl: uploadResult.secure_url, // On utilise l'URL retournée par Cloudinary
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("Erreur Upload/DB:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}