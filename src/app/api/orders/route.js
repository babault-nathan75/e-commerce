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
import sanitize from "mongo-sanitize";
import { sendOrderMail } from "@/services/mail.service"; // ✅ Importation du service mail


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

function sanitizeEmail(email) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
  return isValid ? clean : null;
}

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const body = sanitize(await req.json());
    const data = CreateOrderSchema.parse(body);

    /* 👤 CLIENT */
    let customerName, customerEmail, customerPhone, deliveryAddress;

    if (session?.user) {
      const user = await User.findById(session.user.id).select("name email phone address");
      customerName = user?.name || "Client";
      customerEmail = user?.email;
      customerPhone = data.contactPhone || user?.phone || "";
      deliveryAddress = data.deliveryAddress || user?.address || "";
    } else if (data.guest) {
      customerName = data.guest.name;
      customerEmail = data.guest.email;
      customerPhone = data.guest.phone;
      deliveryAddress = data.guest.deliveryAddress;
    } else {
      return NextResponse.json({ error: "Identification impossible" }, { status: 401 });
    }

    const safeCustomerEmail = sanitizeEmail(customerEmail);

    /* 🛒 PRODUITS & VÉRIFICATION STOCK */
    // On récupère les produits concernés
    const products = await Product.find({ _id: { $in: data.items.map(i => i.productId) } });
    const map = new Map(products.map(p => [p._id.toString(), p]));

    const items = [];

    // On boucle sur les articles demandés pour vérifier le stock AVANT de créer la commande
    for (const itemRequest of data.items) {
      const product = map.get(itemRequest.productId);

      if (!product) {
        return NextResponse.json({ error: "Un des produits est introuvable" }, { status: 400 });
      }

      // 🔴 VÉRIFICATION DU STOCK ICI 🔴
      if (itemRequest.quantity > product.stockAvailable) {
        return NextResponse.json(
          { error: "Votre demande est élévé par rapport au stock actuel" },
          { status: 400 }
        );
      }

      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: itemRequest.quantity
      });
    }

    // Si on arrive ici, c'est que le stock est suffisant pour tous les articles
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderCode = generateOrderCode();

    /* 🧾 CRÉATION COMMANDE */
    const order = await Order.create({
      orderCode,
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice,
      status: "EFFECTUER",
      userId: session?.user?.id || null,
      deliveryAddress,
      contactPhone: customerPhone,
      guest: !session?.user ? data.guest : null
    });

    /* 🔻 MISE À JOUR STOCK RÉEL */
    // On décrémente le stock maintenant que la commande est validée
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stockAvailable: -item.quantity } }
      );
    }

    const orderForMail = { ...order.toObject(), customerName, customerEmail, customerPhone, deliveryAddress };

    /* 📄 PDF */
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePDF(orderForMail);
    } catch (e) {
      console.error("PDF error:", e.message);
    }

    /* 📧 EMAILS */
    const admins = await User.find({ isAdmin: true }).select("email");
    const adminEmails = admins.map(a => a.email).filter(Boolean);

    const notifyAll = async () => {
      const tasks = [];

      // 📧 CLIENT
      if (safeCustomerEmail) {
        tasks.push(
          sendOrderEmail({
            to: safeCustomerEmail,
            subject: `✅ Confirmation de votre commande ${orderCode}`,
            text: buildOrderText(orderForMail),
            html: buildOrderHTML(orderForMail),
            pdfBuffer,
            filename: `facture-${orderCode}.pdf`
          })
        );
      }

      // 📧 ADMIN
      if (adminEmails.length) {
        tasks.push(
          sendOrderEmail({
            to: adminEmails[0],
            bcc: adminEmails.slice(1).join(","),
            subject: `🛒 Nouvelle commande ${orderCode}`,
            text: `Client: ${customerName}\nMontant: ${totalPrice} FCFA`,
            html: `<b>Client:</b> ${customerName}<br/>
                   <b>Total:</b> ${totalPrice} FCFA <br/>
                   <b>Code de commande:</b> ${orderCode}<br/>
                   <b>Date & heure:</b> ${new Date().toLocaleString('fr-FR')}`
          })
        );
      }

      // 📱 WhatsApp
      if (customerPhone) {
        const phone = customerPhone.startsWith("+") ? customerPhone : `+225${customerPhone}`;
        tasks.push(sendWhatsAppMessage(phone, `Commande ${orderCode} reçue.`));
      }

      // 📊 Dashboard
      tasks.push(notifyAdmins({ title: "Nouvelle commande", message: orderCode }));

      await Promise.allSettled(tasks);
    };

    await notifyAll();

    return NextResponse.json({ ok: true, orderId: order._id, orderCode });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}