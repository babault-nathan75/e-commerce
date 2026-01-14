"use server"; // 👈 Indique que ce code s'exécute uniquement sur le serveur

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) throw new Error("Accès refusé");

  await connectDB();

  // On crée le produit directement
  await Product.create({
    ...formData,
    price: Number(formData.price),
    stockAvailable: Number(formData.stock), // ✅ LE BON CHAMP
    isLimited: true,
    category: Array.isArray(formData.category)
        ? formData.category
        : [formData.category]
  });


  // On force Next.js à rafraîchir la liste des produits
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  
  return { success: true };
}
