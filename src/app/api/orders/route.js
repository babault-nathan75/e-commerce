import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { sendOrderEmail, buildOrderText, buildOrderHTML } from "@/lib/mailer";
import { notifyAdmins } from "@/lib/notifyAdmins";
import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import sanitize from 'mongo-sanitize';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1)
  })).min(1),
  deliveryAddress: z.string().min(5).optional().or(z.literal("")),
  contactPhone: z.string().min(6).optional().or(z.literal("")),
  guest: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    deliveryAddress: z.string().min(5)
  }).optional()
});

function generateOrderCode() {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ME-${date}-${rand}`;
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    console.log("🔍 [DEBUG] Session détectée :", session ? `OUI (User: ${session.user.email})` : "NON");

    const body = await req.json();
    const cleanBody = sanitize(body);
    const data = CreateOrderSchema.parse(cleanBody);

    /* 👤 Identification du Client */
    let customerName, customerEmail, customerPhone, deliveryAddress;

    if (session?.user) {
      const userId = session.user.id || session.user._id;
      const user = await User.findById(userId).select("name email phone address");

      customerName = user?.name || session.user.name || "Client";
      customerEmail = user?.email || session.user.email;
      customerPhone = data.contactPhone || user?.phone || "";
      deliveryAddress = data.deliveryAddress || user?.address || "";
      
      console.log("✅ [AUTH] Commande identifiée via Session");
    } 
    else if (data.guest && data.guest.email) {
      customerName = data.guest.name;
      customerEmail = data.guest.email;
      customerPhone = data.guest.phone;
      deliveryAddress = data.guest.deliveryAddress;
      
      console.log("✅ [AUTH] Commande identifiée via Guest");
    } 
    else {
      return NextResponse.json(
        { error: "Identification impossible. Veuillez vous connecter ou remplir les infos de livraison." },
        { status: 401 }
      );
    }

    /* 🔒 Produits & Calcul */
    const ids = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const items = data.items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error(`Produit ${i.productId} introuvable`);
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: i.quantity
      };
    });

    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderCode = generateOrderCode();
    
    /* 💾 Création de la commande */

    /* 🔻 DÉCRÉMENTATION DU STOCK */
    for (const item of items) {
      const product = map.get(item.productId.toString());

      if (product.isLimited) {
        if (product.stockAvailable < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }

        product.stockAvailable -= item.quantity;
        await product.save();
      }
    }

    const order = await Order.create({
      orderCode,
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice,
      status: "EFFECTUER",
      userId: session?.user?.id || null,
      deliveryAddress: deliveryAddress,
      contactPhone: customerPhone,
      guest: !session?.user ? data.guest : null
    });

    const orderForMail = { 
        ...order.toObject(), 
        customerName, 
        customerEmail, 
        customerPhone, 
        deliveryAddress 
    };

    /* 📄 Génération PDF */
    let pdfBuffer = null;
    try { 
        pdfBuffer = await generateInvoicePDF(orderForMail); 
    } catch (e) { 
        console.error("❌ Erreur Génération PDF:", e.message);
    }

    /* ✉️ Configuration du Payload */
    const admins = await User.find({ isAdmin: true }).select("email phone");
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    const mailText = buildOrderText(orderForMail);
    const mailHtml = buildOrderHTML(orderForMail);

    const emailPayload = { 
        subject: `Commande Confirmée ${orderCode}`, 
        text: mailText, 
        html: mailHtml, 
        pdfBuffer, 
        filename: `facture-${orderCode}.pdf` 
    };

    /* 📨 Envoi Synchrone (Indispensable pour Nodemailer en local) */
    const notifyAll = async () => {
        try {
            console.log("📧 Tentative d'envoi des emails via Nodemailer...");
            const emailPromises = [];

            // Email Client
            if (customerEmail) {
                emailPromises.push(sendOrderEmail({ ...emailPayload, to: customerEmail }));
            }

            // Email Admin
            if (adminEmails.length > 0) {
                emailPromises.push(sendOrderEmail({ 
                    ...emailPayload, 
                    to: adminEmails[0], 
                    bcc: adminEmails.slice(1).join(",") 
                }));
            }
            
            // WhatsApp
            const formatNum = (n) => n.startsWith('+') ? n : `+225${n.replace(/\s/g, '')}`;
            if (customerPhone) {
                const waBodyClient = `👋 Bonjour ${customerName} ! Votre commande ${orderCode} (${totalPrice} FCFA) a été reçue. Merci !`;
                emailPromises.push(sendWhatsAppMessage(formatNum(customerPhone), waBodyClient));
            }

            // Dashboard
            emailPromises.push(notifyAdmins({ 
                title: "Nouvelle commande 🛒", 
                message: `Commande ${orderCode} de ${customerName} (${totalPrice} FCFA)` 
            }));

            const results = await Promise.allSettled(emailPromises);
            
            // Log des erreurs éventuelles pour chaque promesse
            results.forEach((res, i) => {
                if (res.status === 'rejected') console.error(`❌ Erreur notification #${i}:`, res.reason);
            });

        } catch (error) {
            console.error("Erreur globale notifications:", error);
        }
    };

    // On attend la fin du processus avant de répondre au client
    await notifyAll();

    return NextResponse.json({ ok: true, orderId: order._id, orderCode });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Données invalides", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 400 });
  }
}