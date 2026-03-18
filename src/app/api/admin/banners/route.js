import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// 1. Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET : Récupérer toutes les bannières
export async function GET() {
  await connectDB();
  const banners = await Banner.find().sort({ createdAt: -1 });
  return NextResponse.json(banners);
}

// POST : Créer une bannière avec Upload Cloudinary
export async function POST(req) {
  try {
    await connectDB();
    
    // 2. On utilise formData() au lieu de json()
    const data = await req.formData();
    const file = data.get("image"); // L'image envoyée par le formulaire
    const title = data.get("title");
    const link = data.get("link");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Image de bannière manquante" }, { status: 400 });
    }

    // 3. Conversion du fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "hebron_banners",
          resource_type: "image" 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 5. Création en base de données avec l'URL Cloudinary
    const newBanner = await Banner.create({
      title: title || "",
      link: link || "",
      imageUrl: uploadResult.secure_url, // L'URL magique de Cloudinary
    });

    return NextResponse.json(newBanner, { status: 201 });

  } catch (error) {
    console.error("Banner Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE : Supprimer une bannière
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    // Optionnel : Tu pourrais aussi supprimer l'image sur Cloudinary ici 
    // si tu stockais l'Id public de l'image.
    
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ message: "Bannière supprimée avec succès" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}