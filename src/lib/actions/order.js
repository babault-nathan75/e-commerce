"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function confirmDelivery(orderId) {
  try {
    await connectDB();

    // 1. Récupérer la commande
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Commande introuvable");
    if (order.status === "delivered") throw new Error("Déjà livrée");

    // 2. Décrémenter le stock pour chaque produit
    // On utilise une boucle Promise.all pour la rapidité
    const stockUpdates = order.items.map((item) => {
      return Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }, // Décrémentation atomique
        { new: true }
      );
    });

    await Promise.all(stockUpdates);

    // 3. Mettre à jour le statut de la commande
    order.status = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    // 4. 👋 IMPORTANT : Rafraîchir la page boutique
    // Cela force Next.js à recalculer les stocks sur /shop
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("Erreur livraison:", error);
    return { success: false, error: error.message };
  }
}