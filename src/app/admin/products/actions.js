"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

/**
 * Action Serveur pour la création d'un nouveau produit.
 * Gère la sécurité, la connexion DB et la synchronisation du cache.
 */
export async function createProductAction(formData) {
  try {
    // 1. VÉRIFICATION DE SÉCURITÉ
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return { success: false, error: "Action non autorisée. Droits administrateur requis." };
    }

    // 2. CONNEXION À LA BASE DE DONNÉES
    await connectDB();

    // 3. CRÉATION DU PRODUIT DANS MONGODB
    // On mappe form.stock (provenant du front) vers stockAvailable (modèle DB)
    const newProduct = await Product.create({
      ...formData,
      price: Number(formData.price),
      stockAvailable: Number(formData.stock), 
      isLimited: true,
      category: Array.isArray(formData.category)
        ? formData.category
        : [formData.category]
    });

    console.log("✅ Produit créé avec succès:", newProduct._id);

    // 4. RÉVALIDATION DU CACHE NEXT.JS
    // On force le serveur à régénérer les pages qui affichent ces produits
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    
    return { success: true, id: newProduct._id.toString() };

  } catch (error) {
    console.error("❌ Erreur createProductAction:", error);
    return { 
      success: false, 
      error: error.message || "Une erreur interne est survenue lors de la création." 
    };
  }
}