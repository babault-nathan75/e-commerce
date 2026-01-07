import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sanitize from 'mongo-sanitize';

export async function POST(req) {
  try {
    const body = await req.json();
    const cleanBody = sanitize(body);
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer le chemin du dossier d'upload
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // S'assurer que le dossier existe
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    // Créer un nom de fichier unique
    const uniqueName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Écrire le fichier sur le disque
    await writeFile(filePath, buffer);
    
    // Retourner l'URL publique
    const url = `/uploads/${uniqueName}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}