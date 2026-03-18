import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(req) {
  // Sécurité : Seul l'admin peut uploader
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit : Accès Admin requis" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    // Limite de taille (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Fichier trop lourd (max 5MB)" }, { status: 400 });
    }

    // 2. Conversion du fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload direct vers Cloudinary via un Stream (Flux)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "hebron_general_uploads", // Dossier cible sur Cloudinary
          resource_type: "auto" 
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      // On injecte le buffer dans le flux
      uploadStream.end(buffer);
    });

    // 4. On retourne l'URL Cloudinary sécurisée
    return NextResponse.json({ 
      ok: true, 
      url: uploadResult.secure_url // ✅ URL type https://res.cloudinary.com/...
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ 
      error: "Échec de l'upload vers Cloudinary", 
      details: error.message 
    }, { status: 500 });
  }
}