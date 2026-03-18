import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary"; // ➕ Import Cloudinary
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { User } from "@/models/User"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOrderEmail } from "@/lib/mailer"; 
import { notifyAdmins } from "@/lib/notifyAdmins"; 
import sanitize from 'mongo-sanitize';

// ✅ CONFIGURATION CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ HELPER UPLOAD CLOUDINARY
async function uploadToCloudinary(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

// ✅ SCHEMA DE VALIDATION
const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
  stock: z.coerce.number().min(0).default(0)
});

const UpdateSchema = ProductSchema.partial();

// --- ➕ MÉTHODE : POST (CRÉATION AVEC IMAGE) ---
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "L'image est requise" }, { status: 400 });
    }

    // 1. Upload vers Cloudinary
    const cloudUrl = await uploadToCloudinary(imageFile);

    // 2. Préparation des données pour Zod
    const rawData = {
      name: formData.get("name"),
      price: formData.get("price"),
      description: formData.get("description"),
      channel: formData.get("channel"),
      productType: formData.get("productType"),
      stock: formData.get("stock"),
      category: formData.get("category") ? JSON.parse(formData.get("category")) : [],
      imageUrl: cloudUrl // On injecte l'URL Cloudinary ici
    };

    const validatedData = ProductSchema.parse(rawData);
    await connectDB();

    const productData = {
      ...validatedData,
      stockAvailable: validatedData.stock
    };

    const newProduct = await Product.create(productData);

    if (newProduct.stockAvailable <= 5) {
      triggerStockAlert(newProduct).catch(err => console.error("Alert Error:", err));
    }

    return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });
  } catch (err) {
    console.error("POST PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Invalid data", details: err?.message }, { status: 400 });
  }
}

// --- 🔍 MÉTHODE : GET ---
export async function GET(_req, context) {
  await connectDB();
  const { id } = await context.params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, product });
}

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary"; // ➕ Import Cloudinary
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { User } from "@/models/User"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOrderEmail } from "@/lib/mailer"; 
import { notifyAdmins } from "@/lib/notifyAdmins"; 
import sanitize from 'mongo-sanitize';

// ✅ CONFIGURATION CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ HELPER UPLOAD CLOUDINARY
async function uploadToCloudinary(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

// ✅ SCHEMA DE VALIDATION
const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
  stock: z.coerce.number().min(0).default(0)
});

const UpdateSchema = ProductSchema.partial();

// --- ➕ MÉTHODE : POST (CRÉATION AVEC IMAGE) ---
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "L'image est requise" }, { status: 400 });
    }

    // 1. Upload vers Cloudinary
    const cloudUrl = await uploadToCloudinary(imageFile);

    // 2. Préparation des données pour Zod
    const rawData = {
      name: formData.get("name"),
      price: formData.get("price"),
      description: formData.get("description"),
      channel: formData.get("channel"),
      productType: formData.get("productType"),
      stock: formData.get("stock"),
      category: formData.get("category") ? JSON.parse(formData.get("category")) : [],
      imageUrl: cloudUrl // On injecte l'URL Cloudinary ici
    };

    const validatedData = ProductSchema.parse(rawData);
    await connectDB();

    const productData = {
      ...validatedData,
      stockAvailable: validatedData.stock
    };

    const newProduct = await Product.create(productData);

    if (newProduct.stockAvailable <= 5) {
      triggerStockAlert(newProduct).catch(err => console.error("Alert Error:", err));
    }

    return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });
  } catch (err) {
    console.error("POST PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Invalid data", details: err?.message }, { status: 400 });
  }
}

// --- 🔍 MÉTHODE : GET ---
export async function GET(_req, context) {
  await connectDB();
  const { id } = await context.params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, product });
}

// --- ⚙️ MÉTHODE : PUT (MODIFICATION SÉCURISÉE) ---
export async function PUT(req, context) {
  try {
    // 1. CRITIQUE POUR NEXT.JS 15 : Awaiter les params pour éviter la 500
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    // Connexion DB
    await connectDB();
    
    // Récupération des données du formulaire
    const formData = await req.formData();
    
    // Recherche du produit
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // 2. GESTION DE L'IMAGE
    let imageUrl = product.imageUrl; 
    const imageInput = formData.get("image");

    // On n'upload QUE si c'est un nouveau fichier binaire
    if (imageInput && typeof imageInput !== "string" && imageInput.size > 0) {
      console.log("☁️ Nouveau fichier détecté, envoi à Cloudinary...");
      imageUrl = await uploadToCloudinary(imageInput);
    } 
    // Si c'est déjà une URL Cloudinary envoyée par le formulaire, on la garde
    else if (typeof imageInput === "string" && imageInput.startsWith("http")) {
      imageUrl = imageInput;
    }

    // 3. PRÉPARATION DES DONNÉES (Nettoyage des types)
    const rawUpdate = {
      name: formData.get("name") || product.name,
      price: formData.get("price") !== "" && formData.get("price") !== null ? Number(formData.get("price")) : product.price,
      description: formData.get("description") || product.description,
      channel: formData.get("channel") || product.channel,
      productType: formData.get("productType") || product.productType,
      imageUrl: imageUrl
    };

    // Gestion du stock
    if (formData.has("stock") && formData.get("stock") !== "") {
      rawUpdate.stock = Number(formData.get("stock"));
    }

    // Parsing sécurisé des catégories
    if (formData.has("category")) {
      const catVal = formData.get("category");
      if (catVal && catVal !== "" && catVal !== "undefined") {
        try {
          rawUpdate.category = typeof catVal === "string" ? JSON.parse(catVal) : catVal;
        } catch (e) {
          rawUpdate.category = product.category;
        }
      }
    }

    // 4. VALIDATION ZOD (Version safeParse pour éviter le crash)
    const result = UpdateSchema.safeParse(rawUpdate);
    
    if (!result.success) {
      // Ce log apparaîtra dans ton terminal Hostinger ou VS Code
      console.error("❌ ERREUR ZOD :", JSON.stringify(result.error.format(), null, 2));
      return NextResponse.json({ 
        error: "Données invalides", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const dataToSave = result.data;

    // 5. SYNCHRONISATION DU STOCK
    if (dataToSave.stock !== undefined) {
      product.stock = dataToSave.stock;
      product.stockAvailable = dataToSave.stock;
      delete dataToSave.stock; // On le retire pour éviter les conflits dans Object.assign
    }

    // 6. SAUVEGARDE FINALE
    product.imageUrl = imageUrl; // On force l'URL (Cloudinary ou ancienne)
    Object.assign(product, dataToSave);
    
    await product.save();
    console.log("✅ Produit mis à jour avec succès :", product.name);

    return NextResponse.json({ ok: true, product });

  } catch (err) {
    // 🚨 CE LOG EST TON MEILLEUR AMI : Il te dira EXACTEMENT pourquoi la 500 arrive
    console.error("💥 CRASH SERVEUR DANS PUT :", err);
    return NextResponse.json({ 
      error: "Erreur interne du serveur", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// --- 🗑️ MÉTHODE : DELETE ---
export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    // 1. Trouver le produit d'abord pour avoir son URL d'image
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 2. Supprimer l'image sur Cloudinary si elle existe
    if (product.imageUrl && product.imageUrl.includes("cloudinary")) {
      try {
        // L'URL ressemble à : .../v12345/products/nom_image.jpg
        // On extrait "products/nom_image" (le public_id)
        const parts = product.imageUrl.split('/');
        const folderAndFile = parts.slice(-2).join('/'); // Récupère "products/nom_image.jpg"
        const publicId = folderAndFile.split('.')[0]; // Retire l'extension ".jpg"

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Erreur suppression Cloudinary:", cloudErr);
        // On continue quand même la suppression en DB même si l'image échoue
      }
    }

    // 3. Supprimer le produit de la base de données
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Helper d'alerte
async function triggerStockAlert(product) {
  const isOutOfStock = product.stockAvailable === 0;
  const alertTitle = isOutOfStock ? "🔴 RUPTURE (CRÉATION)" : "⚠️ STOCK FAIBLE (CRÉATION)";
  const admins = await User.find({ isAdmin: true }).select("email");
  const adminEmails = admins.map(a => a.email).filter(Boolean);

  if (adminEmails.length > 0) {
    await sendOrderEmail({
      to: adminEmails[0],
      bcc: adminEmails.slice(1).join(","),
      subject: `${alertTitle} : ${product.name}`,
      html: `<p>Produit créé avec un stock limité : <b>${product.stockAvailable}</b></p>`
    });
  }
  await notifyAdmins({ title: alertTitle, message: product.name });
}

// --- 🗑️ MÉTHODE : DELETE ---
export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    // 1. Trouver le produit d'abord pour avoir son URL d'image
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 2. Supprimer l'image sur Cloudinary si elle existe
    if (product.imageUrl && product.imageUrl.includes("cloudinary")) {
      try {
        // L'URL ressemble à : .../v12345/products/nom_image.jpg
        // On extrait "products/nom_image" (le public_id)
        const parts = product.imageUrl.split('/');
        const folderAndFile = parts.slice(-2).join('/'); // Récupère "products/nom_image.jpg"
        const publicId = folderAndFile.split('.')[0]; // Retire l'extension ".jpg"

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Erreur suppression Cloudinary:", cloudErr);
        // On continue quand même la suppression en DB même si l'image échoue
      }
    }

    // 3. Supprimer le produit de la base de données
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Helper d'alerte
async function triggerStockAlert(product) {
  const isOutOfStock = product.stockAvailable === 0;
  const alertTitle = isOutOfStock ? "🔴 RUPTURE (CRÉATION)" : "⚠️ STOCK FAIBLE (CRÉATION)";
  const admins = await User.find({ isAdmin: true }).select("email");
  const adminEmails = admins.map(a => a.email).filter(Boolean);

  if (adminEmails.length > 0) {
    await sendOrderEmail({
      to: adminEmails[0],
      bcc: adminEmails.slice(1).join(","),
      subject: `${alertTitle} : ${product.name}`,
      html: `<p>Produit créé avec un stock limité : <b>${product.stockAvailable}</b></p>`
    });
  }
  await notifyAdmins({ title: alertTitle, message: product.name });
}