import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
  stockAvailable: z.coerce.number().min(0).default(0), // ✅ Changé 'stock' en 'stockAvailable'
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Accès Admin requis" }, { status: 403 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "L'image est manquante" }, { status: 400 });
    }

    // 1. Upload Cloudinary
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 2. Préparation des données
    const rawData = {
      name: formData.get("name"),
      price: formData.get("price"),
      description: formData.get("description"),
      channel: formData.get("channel"),
      productType: formData.get("productType"),
      stockAvailable: formData.get("stockAvailable"), // ✅ Utilise le bon nom
      category: formData.get("category") ? JSON.parse(formData.get("category")) : [],
    };

    const validatedData = ProductSchema.parse(rawData);

    // 3. Sauvegarde
    await connectDB();
    const newProduct = await Product.create({
      ...validatedData,
      imageUrl: uploadResult.secure_url,
    });

    return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });

  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json({ error: "Erreur création", details: error.message }, { status: 500 });
  }
}