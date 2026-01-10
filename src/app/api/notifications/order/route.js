import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { buildOrderText } from "@/lib/mailer";
import { sendWhatsApp } from "@/lib/channels/whatsapp";

import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId manquant" }, { status: 400 });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // ===== CLIENT =====
    let customerEmail = "";
    let customerPhone = "";
    let customerName = "";

    if (order.guest?.email) {
      customerEmail = order.guest.email;
      customerPhone = order.guest.phone;
      customerName = order.guest.name;
    } else if (order.userId) {
      const user = await User.findById(order.userId).select("email phone name");
      customerEmail = user?.email || "";
      customerPhone = user?.phone || "";
      customerName = user?.name || "";
    }

    // ===== ADMINS =====
    const admins = await User.find({ isAdmin: true }).select("email phone").lean();
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    const adminPhones = admins.map(a => a.phone).filter(Boolean);

    // ===== PDF =====
    const pdfBuffer = await generateInvoicePDF(order);

    const text = buildOrderText({
      ...order,
      customerName,
      customerEmail,
      customerPhone
    });

    // ===== CONFIG NODEMAILER (GMAIL) =====
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD // mot de passe d’application Google
      }
    });

    // ===== EMAIL CLIENT =====
    if (customerEmail) {
      await transporter.sendMail({
        from: `"Boutique" <${process.env.MAIL_USER}>`,
        to: customerEmail,
        subject: `Votre commande ${order.orderCode}`,
        text,
        attachments: [
          {
            filename: "facture.pdf",
            content: pdfBuffer,
          }
        ]
      });
    }

    // ===== EMAIL ADMINS =====
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: `"Boutique" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_USER,  // adresse technique principale
        bcc: adminEmails,            // adresses admin masquées
        subject: `Nouvelle commande ${order.orderCode}`,
        text,
        attachments: [
          {
            filename: "facture.pdf",
            content: pdfBuffer,
          }
        ]
      });
    }

    // ===== WHATSAPP =====
    try {
      await sendWhatsApp({
        phones: [customerPhone, ...adminPhones].filter(Boolean),
        order
      });
    } catch (e) {
      console.error("Erreur WhatsApp (ignorée)", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur API commande:", err);
    return NextResponse.json(
      { error: "Erreur interne", details: err.message },
      { status: 500 }
    );
  }
}
