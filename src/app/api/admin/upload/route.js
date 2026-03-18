import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// 1. Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file"); // Assure-toi que c'est bien "file" dans ton frontend

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // 2. Conversion en Buffer (on garde cette partie)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. ENVOI VERS CLOUDINARY (Remplace fs.writeFile)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "hebron_uploads",
          resource_type: "auto" 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // On injecte le buffer dans le flux Cloudinary
      uploadStream.end(buffer);
    });

    // 4. On retourne l'URL CLOUDINARY sécurisée
    // Ce sera une URL type https://res.cloudinary.com/...
    return NextResponse.json({ url: uploadResult.secure_url });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ 
      error: "Échec de l'upload vers Cloudinary", 
      details: error.message 
    }, { status: 500 });
  }
}