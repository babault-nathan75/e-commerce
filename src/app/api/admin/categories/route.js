import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product"; // Import nécessaire pour vérifier les stocks
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Fonction utilitaire pour vérifier si l'utilisateur est admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin;
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  const categories = await Category.find(channel ? { channel } : {});
  return NextResponse.json(categories);
}

export async function POST(req) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, channel } = await req.json();
  const category = await Category.create({ name, channel });
  return NextResponse.json(category);
}

export async function PUT(req) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id, name } = await req.json();
  const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
  return NextResponse.json(category);
}

export async function DELETE(req) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // --- LOGIQUE DE PROTECTION ---
  // On compte combien de produits utilisent encore cette catégorie
  const productsCount = await Product.countDocuments({ category: id });

  if (productsCount > 0) {
    return NextResponse.json(
      { error: `Impossible : ce rayon contient encore ${productsCount} produit(s).` }, 
      { status: 400 }
    );
  }

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ message: "Rayon supprimé avec succès" });
}