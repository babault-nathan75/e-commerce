import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  await connectDB();
  const banners = await Banner.find().sort({ createdAt: -1 });
  return NextResponse.json(banners);
}

export async function POST(req) {
  try {
    await connectDB();
    
    // On lit le formulaire complet (Texte + Fichier)
    const data = await req.formData();
    const file = data.get("image"); // Le fichier image
    const title = data.get("title");
    const description = data.get("description");
    const link = data.get("link");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "L'image est requise" }, { status: 400 });
    }

    // 1. Upload vers Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "hebron_banners", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 2. Sauvegarde dans MongoDB avec l'URL Cloudinary générée
    const newBanner = await Banner.create({
      title: title || "",
      description: description || "",
      link: link || "/shop",
      imageUrl: uploadResult.secure_url,
      isActive: true
    });

    return NextResponse.json(newBanner, { status: 201 });

  } catch (error) {
    console.error("Erreur Banner:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ message: "Supprimé" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}