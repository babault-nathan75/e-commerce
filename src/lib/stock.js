import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { notifyAdmins } from "./notification.service";
import { revalidatePath } from "next/cache";

/**
 * PROTOCOLE : Dépréciation Sécurisée d'Inventaire
 * Empêche l'overselling via une validation atomique.
 */
export async function updateProductStock(productId, quantityChange) {
  // On s'assure que quantityChange est négatif pour une vente (ex: -1)
  const isSale = quantityChange < 0;
  const absoluteChange = Math.abs(quantityChange);

  try {
    await connectDB();

    // 1. FILTRE DE SÉCURITÉ ATOMIQUE
    // On ne procède à l'update que si l'ID correspond ET (si c'est une vente) si le stock est suffisant.
    const query = { _id: productId };
    if (isSale) {
      query.stock = { $gte: absoluteChange }; // Condition : Stock >= Quantité demandée
    }

    const updatedProduct = await Product.findOneAndUpdate(
      query,
      { $inc: { stock: quantityChange } },
      { new: true, runValidators: true }
    ).lean();

    // 2. GESTION DES ÉCHECS DE VALIDATION
    if (!updatedProduct) {
      // Si le produit existe mais que la requête a échoué, c'est que le stock était insuffisant
      const productExists = await Product.exists({ _id: productId });
      
      if (productExists) {
        console.error(`[INVENTORY DENIED] : Stock insuffisant pour le module ${productId}`);
        return { 
          success: false, 
          error: "STOCK_INSUFFISANT", 
          msg: "Action annulée : Quantité demandée supérieure aux réserves." 
        };
      }
      
      throw new Error("ID_INTROUVABLE");
    }

    // 3. MONITORING DES SEUILS (ALERTE PUSH)
    if (updatedProduct.stock <= 5 && isSale) {
      await notifyAdmins({
        title: "⚠️ RÉSERVE FAIBLE",
        message: `Stock critique pour ${updatedProduct.name.toUpperCase()} (${updatedProduct.stock} restants).`,
        link: "/admin/products"
      });
    }

    // 4. ACTUALISATION DES INTERFACES
    revalidatePath("/shop");
    revalidatePath(`/product/${productId}`);

    return { 
      success: true, 
      newStock: updatedProduct.stock,
      msg: "TRANSACTION VALIDÉE" 
    };

  } catch (error) {
    console.error(`[SYSTEM CRASH] : Erreur critique inventaire.`, error.message);
    return { success: false, error: "ERR_INTERNAL", msg: error.message };
  }
}