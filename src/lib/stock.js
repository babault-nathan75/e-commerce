import { Product } from "@/models/Product";

export async function updateProductStock(productId, quantityChange) {
  // quantityChange peut être positif (annulation/retour) ou négatif (nouvelle commande)
  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: quantityChange }
  });
}