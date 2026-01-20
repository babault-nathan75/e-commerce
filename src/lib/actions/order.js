"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

/**
 * PROTOCOLE : Validation de Livraison & Dépréciation d'Inventaire
 * Statut : Opération Critique
 */
export async function confirmDelivery(orderId) {
  console.log(`[INVENTORY OPS] : Initialisation du protocole pour l'ID: ${orderId}`);
  
  try {
    await connectDB();

    // 1. VÉRIFICATION DE L'ORDRE DE MISSION
    const order = await Order.findById(orderId);
    if (!order) throw new Error("CODE-01: Commande introuvable dans la base de données");
    if (order.status === "delivered") throw new Error("CODE-02: Alerte - Livraison déjà actée");

    // 2. MISE À JOUR ATOMIQUE DE L'INVENTAIRE
    // Nous utilisons $inc avec une condition de sécurité pour éviter les stocks négatifs
    const stockUpdates = order.items.map(async (item) => {
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: item.productId, 
          stock: { $gte: item.quantity } // Sécurité : Le stock doit être suffisant
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`CODE-03: Stock insuffisant pour le module ${item.productId}`);
      }
      return updatedProduct;
    });

    // Exécution synchrone des mises à jour d'inventaire
    await Promise.all(stockUpdates);
    console.log(`[INVENTORY OPS] : Dépréciation des stocks validée pour ${order.items.length} références.`);

    // 3. ACTUALISATION DU STATUT DE L'ORDRE
    order.status = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    // 4. SYNCHRONISATION DU CACHE (REVALIDATION)
    // On force Next.js à purger les données obsolètes sur les interfaces critiques
    revalidatePath("/shop");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/dashboard");

    console.log(`[INVENTORY OPS] : Protocole terminé. Commande ${orderId} marquée comme LIVRÉE.`);
    
    return { 
      success: true, 
      deliveredAt: order.deliveredAt.toISOString(),
      msg: "TRANSMISSION RÉUSSIE" 
    };

  } catch (error) {
    console.error(`[CRITICAL ERROR] : Échec du protocole de livraison.`, error.message);
    return { 
      success: false, 
      error: error.message,
      code: "TERMINAL_EXEC_FAIL" 
    };
  }
}