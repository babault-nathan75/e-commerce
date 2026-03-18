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

// --- ⚙️ MÉTHODE : PUT (MODIFICATION AVEC OPTION IMAGE) ---
// --- ⚙️ MÉTHODE : PUT (MODIFICATION AVEC OPTION IMAGE) ---
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    await connectDB();
    
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1. Gestion de l'image
    let imageUrl = product.imageUrl;
    const newImage = formData.get("image");
    
    // On vérifie que c'est bien un fichier et pas une string ou du vide
    if (newImage && typeof newImage !== "string" && newImage.size > 0) {
      imageUrl = await uploadToCloudinary(newImage);
    }

    // 2. Extraction et nettoyage des données
    const rawUpdate = {};
    const fields = ["name", "price", "description", "channel", "productType", "stock"];
    
    fields.forEach(f => {
      const val = formData.get(f);
      // On n'ajoute au schéma que si la valeur n'est pas nulle ou vide
      if (val !== null && val !== "") {
        rawUpdate[f] = val;
      }
    });

    // Gestion sécurisée des catégories
    if (formData.has("category")) {
      const catData = formData.get("category");
      try {
        rawUpdate.category = typeof catData === "string" ? JSON.parse(catData) : catData;
      } catch (e) {
        rawUpdate.category = []; // Fallback si le JSON est invalide
      }
    }

    rawUpdate.imageUrl = imageUrl;

    // Validation Zod avec capture d'erreur détaillée
    const result = UpdateSchema.safeParse(rawUpdate);
    if (!result.success) {
      console.error("❌ Erreur Validation Zod:", result.error.format());
      return NextResponse.json({ 
        error: "Données invalides", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const data = result.data;

    // 3. Logique de stock (Mise à jour simultanée de stock et stockAvailable)
    if (data.stock !== undefined) {
      const newStock = Number(data.stock);
      product.stock = newStock;
      product.stockAvailable = newStock;

      if (product.stockAvailable <= 5) {
        const isOutOfStock = product.stockAvailable === 0;
        const alertTitle = isOutOfStock ? "🔴 RUPTURE DE STOCK" : "⚠️ STOCK FAIBLE";
        
        const admins = await User.find({ isAdmin: true }).select("email");
        const adminEmails = admins.map(a => a.email).filter(Boolean);

        if (adminEmails.length > 0) {
          await sendOrderEmail({
            to: adminEmails[0],
            bcc: adminEmails.slice(1).join(","),
            subject: `${alertTitle} : ${product.name}`,
            html: `<p>Produit: <b>${product.name}</b><br>Nouveau Stock: <b>${product.stockAvailable}</b></p>`
          });
        }
        await notifyAdmins({ title: alertTitle, message: `${product.name} (${product.stockAvailable})` });
      }
      // On retire stock pour ne pas que Object.assign crée un doublon ou conflit
      delete data.stock;
    }

    // 4. Mise à jour finale
    Object.assign(product, data);
    await product.save();

    return NextResponse.json({ ok: true, product });

  } catch (err) {
    console.error("💥 PUT PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err?.message }, { status: 500 });
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