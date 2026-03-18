import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary"; 
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

// ✅ SCHEMA DE VALIDATION (Harmonisé sur stockAvailable)
const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
  stockAvailable: z.coerce.number().min(0).default(0) // ✅ Harmonisé ici
});

const UpdateSchema = ProductSchema.partial();

// --- ➕ MÉTHODE : POST ---
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

    const cloudUrl = await uploadToCloudinary(imageFile);

    const rawData = {
      name: formData.get("name"),
      price: formData.get("price"),
      description: formData.get("description"),
      channel: formData.get("channel"),
      productType: formData.get("productType"),
      stockAvailable: formData.get("stockAvailable"), // ✅ Harmonisé
      category: formData.get("category") ? JSON.parse(formData.get("category")) : [],
      imageUrl: cloudUrl 
    };

    const validatedData = ProductSchema.parse(rawData);
    await connectDB();

    // ✅ On utilise directement validatedData car stockAvailable est déjà dedans
    const newProduct = await Product.create(validatedData);

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
    // 1. Next.js 15 exige d'attendre les params
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    await connectDB();
    const formData = await req.formData();
    
    // 2. Recherche du produit (C'est ici que ça crash si l'export Product est cassé)
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // 3. GESTION DE L'IMAGE CLOUDINARY
    let imageUrl = product.imageUrl; 
    const imageInput = formData.get("image");

    if (imageInput && typeof imageInput !== "string" && imageInput.size > 0) {
      imageUrl = await uploadToCloudinary(imageInput);
    } 
    else if (typeof imageInput === "string" && imageInput.startsWith("http")) {
      imageUrl = imageInput;
    }

    // 4. PRÉPARATION DES DONNÉES (Harmonisé sur stockAvailable)
    const rawUpdate = {
      name: formData.get("name") || product.name,
      price: formData.get("price") ? Number(formData.get("price")) : product.price,
      description: formData.get("description") || product.description,
      channel: formData.get("channel") || product.channel,
      productType: formData.get("productType") || product.productType,
      imageUrl: imageUrl,
      // On s'assure de récupérer stockAvailable du formulaire
      stockAvailable: formData.get("stockAvailable") !== "" && formData.get("stockAvailable") !== null 
        ? Number(formData.get("stockAvailable")) 
        : product.stockAvailable
    };

    // Gestion sécurisée des catégories
    if (formData.has("category")) {
      const catVal = formData.get("category");
      try {
        rawUpdate.category = typeof catVal === "string" ? JSON.parse(catVal) : catVal;
      } catch (e) {
        rawUpdate.category = product.category;
      }
    }

    // 5. VALIDATION ZOD
    // Note : Ton ProductSchema doit aussi utiliser stockAvailable pour que ceci passe
    const result = UpdateSchema.safeParse(rawUpdate);
    
    if (!result.success) {
      console.error("❌ ERREUR ZOD :", JSON.stringify(result.error.format(), null, 2));
      return NextResponse.json({ 
        error: "Données invalides", 
        details: result.error.format() 
      }, { status: 400 });
    }

    // 6. SAUVEGARDE FINALE
    product.imageUrl = imageUrl;
    Object.assign(product, result.data);
    
    await product.save();
    console.log("✅ Produit mis à jour :", product.name);

    // Alerte de stock si nécessaire
    if (product.stockAvailable <= 5) {
      triggerStockAlert(product).catch(err => console.error("Alert Error:", err));
    }

    return NextResponse.json({ ok: true, product });

  } catch (err) {
    console.error("💥 CRASH SERVEUR DANS PUT :", err);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: err.message 
    }, { status: 500 });
  }
}

// --- 🗑️ MÉTHODE : DELETE (AVEC SUPPRESSION CLOUDINARY FIABLE) ---
export async function DELETE(_req, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // 1. SUPPRESSION SUR CLOUDINARY
    if (product.imageUrl && product.imageUrl.includes("cloudinary.com")) {
      try {
        // Cette regex extrait tout ce qui se trouve entre le numéro de version (v123...) 
        // et l'extension (.jpg, .png). C'est la méthode la plus sûre.
        const regex = /\/v\d+\/(.+)\.[a-z]+$/;
        const match = product.imageUrl.match(regex);

        if (match && match[1]) {
          const publicId = match[1]; 
          console.log("🗑️ Tentative de suppression Cloudinary ID :", publicId);
          
          const cloudRes = await cloudinary.uploader.destroy(publicId);
          console.log("☁️ Réponse Cloudinary :", cloudRes.result); // Doit afficher "ok"
        }
      } catch (cloudErr) {
        console.error("⚠️ Erreur lors de la suppression Cloudinary :", cloudErr.message);
        // On continue quand même pour supprimer le produit de la DB
      }
    }

    // 2. SUPPRESSION DANS MONGODB
    await Product.findByIdAndDelete(id);
    console.log("✅ Produit supprimé de la base de données.");

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("💥 ERREUR DELETE :", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

async function triggerStockAlert(product) {
  const isOutOfStock = product.stockAvailable === 0;
  const alertTitle = isOutOfStock ? "🔴 RUPTURE" : "⚠️ STOCK FAIBLE";
  const admins = await User.find({ isAdmin: true }).select("email");
  const adminEmails = admins.map(a => a.email).filter(Boolean);

  if (adminEmails.length > 0) {
    await sendOrderEmail({
      to: adminEmails[0],
      bcc: adminEmails.slice(1).join(","),
      subject: `${alertTitle} : ${product.name}`,
      html: `<p>Produit: <b>${product.name}</b> - Stock: <b>${product.stockAvailable}</b></p>`
    });
  }
  await notifyAdmins({ title: alertTitle, message: product.name });
}