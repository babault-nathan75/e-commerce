import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOrderEmail, buildOrderText } from "@/lib/mailer";
import { notifyAdmins } from "@/lib/notifyAdmins";
import { generateInvoicePDF } from "@/lib/pdf/invoice";

/* ===============================
   SCHEMA ZOD
================================ */
const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1)
    })
  ).min(1),

  deliveryAddress: z.string().min(5),
  contactPhone: z.string().min(6),

  guest: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    deliveryAddress: z.string().min(5)
  }).optional()
});

/* ===============================
   UTILS
================================ */
function generateOrderCode() {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ME-${date}-${rand}`;
}

/* ===============================
   GET ORDERS
================================ */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const filter = session.user.isAdmin
    ? {}
    : { userId: session.user.id };

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json({ ok: true, orders });
}

/* ===============================
   CREATE ORDER
================================ */
export async function POST(req) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const data = CreateOrderSchema.parse(body);

    await connectDB();

    /* 🔒 Anti-triche */
    const ids = data.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map(p => [p._id.toString(), p]));

    const items = data.items.map(i => {
      const p = map.get(i.productId);
      if (!p) throw new Error("Produit introuvable");
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: i.quantity
      };
    });

    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderCode = generateOrderCode();
    const isGuest = !session?.user;

    const order = await Order.create({
      orderCode,
      items,
      totalItems,
      totalPrice,
      status: "EFFECTUER",
      userId: session?.user?.id || null,
      deliveryAddress: data.deliveryAddress,
      contactPhone: data.contactPhone,
      guest: isGuest ? data.guest : null
    });

    /* ===============================
       INFOS CLIENT
    ============================== */
    let customerName = "";
    let customerEmail = "";
    let customerPhone = "";
    let deliveryAddress = order.deliveryAddress;

    if (order.guest?.email) {
      customerName = order.guest.name;
      customerEmail = order.guest.email;
      customerPhone = order.guest.phone;
      deliveryAddress = order.guest.deliveryAddress;
    } else if (order.userId) {
      const user = await User.findById(order.userId)
        .select("name email phone address");
      customerName = user?.name || "";
      customerEmail = user?.email || "";
      customerPhone = order.contactPhone || user?.phone || "";
      deliveryAddress = order.deliveryAddress || user?.address || "";
    }

    /* ===============================
       EMAIL CONTENT
    ============================== */
    const orderForMail = {
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      status: order.status,
      items: order.items,
      totalItems: order.totalItems,
      totalPrice: order.totalPrice,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress
    };

    const text = buildOrderText(orderForMail);

    /* 📄 PDF FACTURE */
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePDF(orderForMail);
    } catch (e) {
      console.warn("⚠️ Facture PDF non générée:", e);
    }

    /* ===============================
       EMAIL ADMINS
    ============================== */
    const admins = await User.find({ isAdmin: true }).select("email");
    const adminEmails = admins.map(a => a.email).filter(Boolean);

    if (adminEmails.length > 0) {
      await sendOrderEmail({
        to: process.env.RESEND_ADMIN_FALLBACK || adminEmails[0],
        bcc: adminEmails,
        subject: `Nouvelle commande ${order.orderCode}`,
        text,
        pdfBuffer,
        filename: `commande-${order.orderCode}.pdf`
      });
    }

    /* ===============================
       EMAIL CLIENT
    ============================== */
    if (customerEmail) {
      await sendOrderEmail({
        to: customerEmail,
        subject: `Votre commande ${order.orderCode}`,
        text,
        pdfBuffer,
        filename: `commande-${order.orderCode}.pdf`
      });
    }

    /* 🔔 NOTIFICATION INTERNE ADMINS */
    await notifyAdmins({
      title: "Nouvelle commande 🛒",
      message: `Commande ${order.orderCode} créée`,
      link: "/admin/orders"
    });

    return NextResponse.json({
      ok: true,
      orderId: order._id.toString(),
      orderCode: order.orderCode
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Commande invalide" },
      { status: 400 }
    );
  }
}
