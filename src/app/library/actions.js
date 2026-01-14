"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

const PAGE_SIZE = 12;

function serializeProduct(p) {
  return {
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
    // On garantit que stock est toujours un nombre, même si absent en DB
    stock: typeof p.stock === 'number' ? p.stock : 0 
  };
}

export async function fetchLibraryProducts(filters) {
  await connectDB();

  const {
    search = "",
    category = "",
    minPrice = "",
    maxPrice = "",
    isNew = false,
    isPromo = false,
    sort = "newest",
    page = 1
  } = filters;

  const query = { channel: "library" };

  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (isNew) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    query.createdAt = { $gte: d };
  }

  if (isPromo) query.isOnSale = true;

  // --- LOGIQUE DE TRI ---
  // On crée un tri composite : Priorité au stock, puis au filtre choisi
  let sortQuery = {};
  
  // Optionnel : Mettre "stock: -1" en premier pour toujours afficher 
  // les articles disponibles en haut de liste
  const stockPriority = { stock: -1 }; 

  if (sort === "price_asc") sortQuery = { ...stockPriority, price: 1 };
  else if (sort === "price_desc") sortQuery = { ...stockPriority, price: -1 };
  else if (sort === "popular") sortQuery = { ...stockPriority, soldCount: -1 };
  else sortQuery = { ...stockPriority, createdAt: -1 }; // newest par défaut

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortQuery)
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const safeProducts = products.map(serializeProduct);

  return {
    products: safeProducts,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE)
  };
}