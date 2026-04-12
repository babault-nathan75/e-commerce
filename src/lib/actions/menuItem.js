"use server";

import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. CRÉER UN NOUVEAU PLAT
// ==========================================
export async function createMenuItem(formData) {
  try {
    const name = formData.get("name");
    const category = formData.get("category"); // 👈 On récupère la catégorie
    const price = formData.get("price");
    const description = formData.get("description");
    const restaurant = formData.get("restaurant");
    const file = formData.get("image");

    let imageUrl = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `plat_${timestamp}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "menu");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/menu/${fileName}`;
    }

    await connectDB();

    await MenuItem.create({
      name,
      category: category || "Plats de résistance", // 👈 On la sauvegarde ici
      price: Number(price),
      description,
      restaurant,
      imageUrl,
      isAvailable: true,
    });

    revalidatePath("/admin/gastronomie/en-ligne");
    return { success: true };
  } catch (error) {
    console.error("Erreur createMenuItem:", error);
    return { success: false, error: "Erreur lors de la création." };
  }
}

// ==========================================
// 2. BASCULER LA DISPONIBILITÉ (EN LIGNE / ÉPUISÉ)
// ==========================================
export async function toggleMenuItemStatus(id) {
  try {
    await connectDB();
    const item = await MenuItem.findById(id);
    if (!item) return { success: false, error: "Plat introuvable" };
    
    item.isAvailable = !item.isAvailable;
    await item.save();
    revalidatePath("/admin/gastronomie/en-ligne");
    return { success: true, isAvailable: item.isAvailable };
  } catch (error) {
    return { success: false, error: "Erreur toggle." };
  }
}

// ==========================================
// 3. SUPPRIMER UN PLAT
// ==========================================
export async function deleteMenuItem(id) {
  try {
    await connectDB();
    await MenuItem.findByIdAndDelete(id);
    revalidatePath("/admin/gastronomie/en-ligne");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur suppression." };
  }
}

// ==========================================
// 4. RÉCUPÉRER UN PLAT PAR SON ID
// ==========================================
export async function getMenuItemById(id) {
  try {
    await connectDB();
    const item = await MenuItem.findById(id).lean();
    if (!item) return null;
    return {
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt?.toISOString(),
      updatedAt: item.updatedAt?.toISOString()
    };
  } catch (error) {
    return null;
  }
}

// ==========================================
// 5. METTRE À JOUR UN PLAT
// ==========================================
export async function updateMenuItem(id, formData) {
  try {
    const name = formData.get("name");
    const category = formData.get("category"); // 👈 On récupère la catégorie
    const price = formData.get("price");
    const description = formData.get("description");
    const restaurant = formData.get("restaurant");
    const file = formData.get("image");

    let updateData = {
      name,
      category: category || "Plats de résistance", // 👈 On la sauvegarde
      price: Number(price),
      description,
      restaurant,
    };

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `plat_${timestamp}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "menu");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      updateData.imageUrl = `/uploads/menu/${fileName}`;
    }

    await connectDB();
    await MenuItem.findByIdAndUpdate(id, updateData);
    revalidatePath("/admin/gastronomie/en-ligne");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur modification." };
  }
}

// ==========================================
// 6. RÉCUPÉRER LE MENU PUBLIC D'UN RESTAURANT
// ==========================================
export async function getPublicMenu(restaurant) {
  try {
    await connectDB();
    const items = await MenuItem.find({ restaurant, isAvailable: true }).lean();
    return items.map(item => ({
      ...item,
      _id: item._id.toString(),
    }));
  } catch (error) {
    return [];
  }
}