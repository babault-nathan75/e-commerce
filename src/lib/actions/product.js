"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function updateProduct(productId, formData) {
  try {
    await connectDB();

    // On récupère les données du formulaire
    const updates = {
      name: formData.get("name"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      category: formData.get("category"),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true }
    );

    // Rafraîchir la boutique pour mettre à jour les barres de stock
    revalidatePath("/shop");
    revalidatePath(`/product/${productId}`);

    return { success: true, product: updatedProduct };
  } catch (error) {
    return { success: false, error: error.message };
  }
}