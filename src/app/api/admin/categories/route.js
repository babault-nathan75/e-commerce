import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Fonction utilitaire centralisée
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user?.isAdmin;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  // 🛡️ Blocage immédiat si pas admin
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  
  const categories = await Category.find(channel ? { channel } : {});
  return NextResponse.json(categories);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await connectDB();
  const { name, channel } = await req.json();
  
  if (!name || !channel) {
    return NextResponse.json({ error: "Nom et canal requis" }, { status: 400 });
  }

  const category = await Category.create({ name, channel });
  return NextResponse.json(category);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await connectDB();
  const { id, name } = await req.json();
  
  const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
  if (!category) {
    return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  // --- LOGIQUE DE PROTECTION ---
  // Vérification si des produits sont liés à l'ID ou au nom de la catégorie
  const productsCount = await Product.countDocuments({ category: id });

  if (productsCount > 0) {
    return NextResponse.json(
      { error: `Impossible : cette catégorie est liée à ${productsCount} produit(s).` }, 
      { status: 400 }
    );
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
  }

  return NextResponse.json({ message: "Catégorie supprimée avec succès" });
}