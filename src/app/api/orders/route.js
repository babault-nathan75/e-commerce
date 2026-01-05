import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOrderEmail, buildOrderText, buildOrderHTML } from "@/lib/mailer";
import { notifyAdmins } from "@/lib/notifyAdmins";
import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const emptyToUndefined = (val) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1)
  })).min(1),
  deliveryAddress: z.preprocess(emptyToUndefined, z.string().min(5).optional()),
  contactPhone: z.preprocess(emptyToUndefined, z.string().min(6).optional()),
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
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const data = CreateOrderSchema.parse(body);

    await connectDB();

    /* 🔒 Vérification Produits & Prix */
    const ids = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const items = data.items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error("Produit introuvable");
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
    const order = await Order.create({
      orderCode,
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice,
      status: "EFFECTUER",
      userId: session?.user?.id || null,
      deliveryAddress: data.deliveryAddress,
      contactPhone: data.contactPhone,
      guest: !session?.user ? data.guest : null
    });

    /* 👤 Identification du Client */
    let customerName = "", customerEmail = "", customerPhone = "", deliveryAddress = "";
    if (order.guest?.email) {
      customerName = order.guest.name;
      customerEmail = order.guest.email;
      customerPhone = order.guest.phone;
      deliveryAddress = order.guest.deliveryAddress;
    } else {
      const user = await User.findById(order.userId);
      customerName = user?.name || "Client";
      customerEmail = user?.email || "";
      customerPhone = data.contactPhone || user?.phone || "";
      deliveryAddress = data.deliveryAddress || user?.address || "";
    }

    const orderForMail = { ...order._doc, customerName, customerEmail, customerPhone, deliveryAddress };

    /* 📄 Génération PDF */
    let pdfBuffer = null;
    try { 
        pdfBuffer = await generateInvoicePDF(orderForMail); 
    } catch (e) { 
        console.error("❌ Détail Erreur PDF:", e.message); // Modifie ceci pour voir le vrai problème
      }

    /* ✉️ Envoi Emails (Admin & Client) */
    const admins = await User.find({ isAdmin: true }).select("email phone");
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    const mailText = buildOrderText(orderForMail);
    const mailHtml = buildOrderHTML(orderForMail);

    const emailPayload = { subject: `Commande ${orderCode}`, text: mailText, html: mailHtml, pdfBuffer, filename: `facture-${orderCode}.pdf` };

    if (adminEmails.length > 0) await sendOrderEmail({ ...emailPayload, to: adminEmails[0], bcc: adminEmails });
    if (customerEmail) await sendOrderEmail({ ...emailPayload, to: customerEmail });

    /* 📱 WhatsApp (Client & Admins) */
    const waBodyClient = `👋 Bonjour ${customerName} ! Votre commande ${orderCode} (${totalPrice} FCFA) a été reçue. Merci de votre confiance !`;
    const waBodyAdmin = `🚨 NOUVELLE COMMANDE 🚨\nCode: ${orderCode}\nClient: ${customerName}\nMontant: ${totalPrice} FCFA.`;

    // Formatage numéro (Ex: CI +225)
    const formatNum = (n) => n.startsWith('+') ? n : `+225${n}`;

    if (customerPhone) sendWhatsAppMessage(formatNum(customerPhone), waBodyClient).catch(console.error);
    admins.forEach(admin => {
      if (admin.phone) sendWhatsAppMessage(formatNum(admin.phone), waBodyAdmin).catch(console.error);
    });

    /* 🔔 Dashboard Alert */
    await notifyAdmins({ title: "Nouvelle commande 🛒", message: `Commande ${orderCode} de ${totalPrice} FCFA` });

    return NextResponse.json({ ok: true, orderId: order._id, orderCode });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 400 });
  }
}