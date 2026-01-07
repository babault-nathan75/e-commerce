import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { NextResponse } from "next/server";
import sanitize from 'mongo-sanitize';

// GET : Récupérer toutes les bannières
export async function GET() {
  await connectDB();
  const banners = await Banner.find().sort({ createdAt: -1 });
  return NextResponse.json(banners);
}

// POST : Créer une bannière
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const cleanBody = sanitize(body);
    const banner = await Banner.create(cleanBody);
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE : Supprimer une bannière
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