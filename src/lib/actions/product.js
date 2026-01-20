"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

/**
 * PROTOCOLE : Actualisation des Paramètres Produit
 * Statut : Maintenance de l'Inventaire
 */
export async function updateProduct(productId, formData) {
  console.log(`[CATALOG OPS] : Requête de modification pour le module ID: ${productId}`);

  try {
    await connectDB();

    // 1. EXTRACTION ET NETTOYAGE DES DONNÉES
    const updates = {
      name: formData.get("name")?.toString().trim(),
      price: Math.abs(Number(formData.get("price"))), // Sécurité : pas de prix négatif
      stock: Math.max(0, Number(formData.get("stock"))), // Sécurité : stock minimum 0
      category: formData.get("category"),
      description: formData.get("description"), // Optionnel : extension du catalogue
    };

    // 2. VALIDATION DES CHAMPS CRITIQUES
    if (!updates.name || isNaN(updates.price)) {
      throw new Error("CODE-04: Paramètres d'entrée corrompus ou manquants");
    }

    // 3. EXÉCUTION DE LA MISE À JOUR
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true } // On active les validateurs du schéma Mongoose
    );

    if (!updatedProduct) {
      throw new Error("CODE-05: Référence introuvable dans le registre central");
    }

    // 4. SYNCHRONISATION MULTI-CANAL (REVALIDATION)
    // On purge le cache pour tous les points de vue de l'interface
    revalidatePath("/shop"); // Boutique publique
    revalidatePath(`/product/${productId}`); // Page détail produit
    revalidatePath("/admin/products"); // Dashboard administration
    
    console.log(`[CATALOG OPS] : Module "${updates.name}" mis à jour avec succès.`);

    return { 
      success: true, 
      product: JSON.parse(JSON.stringify(updatedProduct)), // Nettoyage pour Next.js
      msg: "PROTOCOLE TERMINÉ : REGISTRE ACTUALISÉ" 
    };

  } catch (error) {
    console.error(`[CRITICAL ERROR] : Échec de la maintenance catalogue.`, error.message);
    return { 
      success: false, 
      error: error.message,
      code: "CATALOG_UPDATE_FAIL" 
    };
  }
}