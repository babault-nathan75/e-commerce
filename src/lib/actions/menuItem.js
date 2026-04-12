"use server";

import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import cloudinary from "@/lib/cloudinary"; // 👈 On utilise ton nouvel utilitaire
import { revalidatePath } from "next/cache";

// Fonction utilitaire pour uploader vers Cloudinary (évite la répétition)
const uploadToCloudinary = async (file, folder) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// ==========================================
// 1. CRÉER UN NOUVEAU PLAT
// ==========================================
export async function createMenuItem(formData) {
  try {
    const name = formData.get("name");
    const category = formData.get("category");
    const price = formData.get("price");
    const description = formData.get("description");
    const restaurant = formData.get("restaurant");
    const file = formData.get("image");

    let imageUrl = null;

    if (file && file.size > 0) {
      // 🚀 Upload vers Cloudinary au lieu du disque local
      imageUrl = await uploadToCloudinary(file, "menu_gastronomie");
    }

    await connectDB();

    await MenuItem.create({
      name,
      category: category || "Plats de résistance",
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
// 2. BASCULER LA DISPONIBILITÉ
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
    // Note : On pourrait aussi supprimer l'image sur Cloudinary ici avec l'ID
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
    const category = formData.get("category");
    const price = formData.get("price");
    const description = formData.get("description");
    const restaurant = formData.get("restaurant");
    const file = formData.get("image");

    let updateData = {
      name,
      category: category || "Plats de résistance",
      price: Number(price),
      description,
      restaurant,
    };

    if (file && file.size > 0) {
      // 🚀 Upload de la nouvelle image vers Cloudinary
      updateData.imageUrl = await uploadToCloudinary(file, "menu_gastronomie");
    }

    await connectDB();
    await MenuItem.findByIdAndUpdate(id, updateData);
    revalidatePath("/admin/gastronomie/en-ligne");
    return { success: true };
  } catch (error) {
    console.error("Erreur updateMenuItem:", error);
    return { success: false, error: "Erreur modification." };
  }
}

// ==========================================
// 6. RÉCUPÉRER LE MENU PUBLIC
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