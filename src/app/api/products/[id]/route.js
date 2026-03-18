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

// --- ⚙️ MÉTHODE : PUT (MODIFICATION SÉCURISÉE ET HARMONISÉE) ---
export async function PUT(req, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    await connectDB();
    const formData = await req.formData();
    
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // 1. Gestion de l'image (Cloudinary)
    let imageUrl = product.imageUrl; 
    const imageInput = formData.get("image");

    if (imageInput && typeof imageInput !== "string" && imageInput.size > 0) {
      imageUrl = await uploadToCloudinary(imageInput);
    } 
    else if (typeof imageInput === "string" && imageInput.startsWith("http")) {
      imageUrl = imageInput;
    }

    // 2. Préparation des données (Utilisation de stockAvailable)
    const rawUpdate = {
      name: formData.get("name") || product.name,
      price: formData.get("price") ? Number(formData.get("price")) : product.price,
      description: formData.get("description") || product.description,
      channel: formData.get("channel") || product.channel,
      productType: formData.get("productType") || product.productType,
      imageUrl: imageUrl,
      stockAvailable: formData.get("stockAvailable") !== "" && formData.get("stockAvailable") !== null 
        ? Number(formData.get("stockAvailable")) 
        : product.stockAvailable
    };

    if (formData.has("category")) {
      const catVal = formData.get("category");
      try {
        rawUpdate.category = typeof catVal === "string" ? JSON.parse(catVal) : catVal;
      } catch (e) {
        rawUpdate.category = product.category;
      }
    }

    // 3. Validation Zod Safe
    const result = UpdateSchema.safeParse(rawUpdate);
    
    if (!result.success) {
      console.error("❌ ERREUR ZOD :", JSON.stringify(result.error.format(), null, 2));
      return NextResponse.json({ 
        error: "Données invalides", 
        details: result.error.format() 
      }, { status: 400 });
    }

    // 4. Sauvegarde finale
    product.imageUrl = imageUrl;
    Object.assign(product, result.data);
    
    await product.save();
    console.log("✅ Produit mis à jour avec succès :", product.name);

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

// --- 🗑️ MÉTHODE : DELETE ---
export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (product.imageUrl && product.imageUrl.includes("cloudinary")) {
      try {
        const parts = product.imageUrl.split('/');
        const folderAndFile = parts.slice(-2).join('/');
        const publicId = folderAndFile.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Erreur Cloudinary:", cloudErr);
      }
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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