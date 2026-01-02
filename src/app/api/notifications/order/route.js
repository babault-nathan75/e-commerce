import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { buildOrderText, sendOrderEmail } from "@/lib/mailer";
import { sendWhatsApp } from "@/lib/channels/whatsapp";

export async function POST(req) {
  await connectDB();

  const { orderId } = await req.json();
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
    customerEmail = user?.email;
    customerPhone = user?.phone;
    customerName = user?.name;
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

  // ===== EMAIL CLIENT =====
  if (customerEmail) {
    await sendOrderEmail({
      to: customerEmail,
      subject: `Votre commande ${order.orderCode}`,
      text,
      pdfBuffer
    });
  }

  // ===== EMAIL ADMINS =====
  if (adminEmails.length > 0) {
    await sendOrderEmail({
      to: "orders@resend.dev",
      bcc: adminEmails,
      subject: `Nouvelle commande ${order.orderCode}`,
      text,
      pdfBuffer
    });
  }

  // ===== WHATSAPP =====
  await sendWhatsApp({
    phones: [customerPhone, ...adminPhones].filter(Boolean),
    order
  });

  return NextResponse.json({ ok: true });
}
