import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
// Note: Le sanitize sur un FormData se fait différemment, 
// mais pour un nom de fichier, le replaceAll suffit ici.

export async function POST(req) {
  try {
    // 1. On récupère directement le FormData (SANS appeler req.json())
    const data = await req.formData();
    const file = data.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Créer le chemin du dossier d'upload
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // 3. S'assurer que le dossier existe
    await mkdir(uploadDir, { recursive: true });

    // 4. Créer un nom de fichier unique et nettoyé
    // On sanitize le nom du fichier pour éviter les caractères spéciaux
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, uniqueName);

    // 5. Écrire le fichier sur le disque
    await writeFile(filePath, buffer);
    
    // 6. Retourner l'URL publique
    const url = `/uploads/${uniqueName}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload Error:", error);
    // On retourne une réponse JSON propre même en cas d'erreur
    return NextResponse.json({ 
      error: "Échec de l'upload", 
      details: error.message 
    }, { status: 500 });
  }
}