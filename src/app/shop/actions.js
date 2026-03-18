"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner";

const PAGE_SIZE = 12;

export async function getShopData({ search = "", category = "", page = 1 }) {
  try {
    await connectDB();
    const skip = (page - 1) * PAGE_SIZE;

    const [categories, activeBanners] = await Promise.all([
      Product.distinct("category", { channel: "shop" }),
      Banner.find({ isActive: true, link: "/shop" }).sort({ createdAt: -1 }).lean()
    ]);

    const query = { channel: "shop" };
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const [productsRaw, total] = await Promise.all([
      Product.find(query)
        .sort({ stockAvailable: -1, createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(query)
    ]);

    return {
      categories: JSON.parse(JSON.stringify(categories)),
      banners: JSON.parse(JSON.stringify(activeBanners)),
      products: JSON.parse(JSON.stringify(productsRaw)),
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
      error: null
    };
  } catch (error) {
    console.error("Erreur getShopData:", error);
    return { error: "Erreur lors du chargement des données" };
  }
}