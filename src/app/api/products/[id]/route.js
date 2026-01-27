import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { User } from "@/models/User"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOrderEmail } from "@/lib/mailer"; 
import { notifyAdmins } from "@/lib/notifyAdmins"; 
import sanitize from 'mongo-sanitize';

// ✅ SCHEMA DE VALIDATION (Coerce pour les types numériques)
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

const UpdateSchema = ProductSchema.partial(); // Pour ton PUT existant

// --- ➕ NOUVELLE MÉTHODE : POST (CRÉATION) ---
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = sanitize(await req.json());
    const validatedData = ProductSchema.parse(body);

    // Initialisation du champ de stock réel pour ton modèle
    const productData = {
      ...validatedData,
      stockAvailable: validatedData.stock
    };

    const newProduct = await Product.create(productData);

    // 🔥 ALERTE SI CRÉÉ AVEC UN STOCK FAIBLE (<= 5)
    if (newProduct.stockAvailable <= 5) {
      triggerStockAlert(newProduct).catch(err => console.error("Alert Error:", err));
    }

    return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });
  } catch (err) {
    console.error("POST PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Invalid data", details: err?.message }, { status: 400 });
  }
}

// --- 🔍 TON GET EXISTANT (INCHANGÉ) ---
export async function GET(_req, context) {
  await connectDB();
  const { id } = await context.params;

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product });
}

// --- ⚙️ TON PUT EXISTANT (INCHANGÉ) ---
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = sanitize(await req.json());
    const data = UpdateSchema.parse(body);

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (data.stock !== undefined) {
      product.stockAvailable = data.stock;

      if (product.stockAvailable <= 5) {
        const isOutOfStock = product.stockAvailable === 0;
        const alertTitle = isOutOfStock ? "🔴 RUPTURE DE STOCK" : "⚠️ STOCK FAIBLE";
        const alertMessage = isOutOfStock
          ? `Le produit "${product.name}" est maintenant épuisé (Stock: 0).`
          : `Attention, il ne reste que ${product.stockAvailable} exemplaires du produit "${product.name}".`;

        const admins = await User.find({ isAdmin: true }).select("email");
        const adminEmails = admins.map(a => a.email).filter(Boolean);

        if (adminEmails.length > 0) {
          await sendOrderEmail({
            to: adminEmails[0],
            bcc: adminEmails.slice(1).join(","),
            subject: `${alertTitle} : ${product.name}`,
            text: alertMessage,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: ${isOutOfStock ? 'red' : 'orange'};">${alertTitle}</h2>
                    <p><strong>Produit :</strong> ${product.name}</p>
                    <p><strong>Stock actuel :</strong> ${product.stockAvailable}</p>
                    <p>Veuillez penser à réapprovisionner ce produit rapidement.</p>
                   </div>`
          });
        }

        await notifyAdmins({ 
            title: alertTitle, 
            message: `${product.name} (${product.stockAvailable} restants)` 
        });
      }
      delete data.stock;
    }

    Object.assign(product, data);
    await product.save();

    return NextResponse.json({ ok: true, product });

  } catch (err) {
    console.error("PUT PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Invalid request", details: err?.message }, { status: 400 });
  }
}

// --- 🗑️ TON DELETE EXISTANT (INCHANGÉ) ---
export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

/**
 * Fonctions d'alerte partagées (Helper)
 */
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