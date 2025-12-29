import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendMail, buildOrderText } from "@/lib/mailer";

function generateOrderCode() {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ME-${date}-${rand}`;
}

const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1)
      })
    )
    .min(1),

  // Pour connecté OU invité
  deliveryAddress: z.string().min(5),
  contactPhone: z.string().min(6),

  // Pour invité seulement
  guest: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(6),
      deliveryAddress: z.string().min(5)
    })
    .optional()
});

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const isAdmin = !!session.user.isAdmin;
  const filter = isAdmin ? {} : { userId: session.user.id };

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ ok: true, orders });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const data = CreateOrderSchema.parse(body);

    await connectDB();

    // 1) Recalcul items depuis DB (anti-triche)
    const ids = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const items = [];
    for (const i of data.items) {
      const p = map.get(i.productId);
      if (!p) {
        return NextResponse.json({ error: "Un produit n'existe plus" }, { status: 400 });
      }
      items.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: i.quantity
      });
    }

    const totalItems = items.reduce((s, it) => s + it.quantity, 0);
    const totalPrice = items.reduce((s, it) => s + it.quantity * it.price, 0);

    const isGuest = !session?.user;

    if (isGuest && !data.guest) {
      return NextResponse.json({ error: "Infos invité manquantes" }, { status: 400 });
    }

    // 2) Création commande
    const orderCode = generateOrderCode();

    const created = await Order.create({
      orderCode,
      items,
      totalItems,
      totalPrice,
      status: "EFFECTUER",

      userId: session?.user ? session.user.id : null,

      deliveryAddress: data.deliveryAddress,
      contactPhone: data.contactPhone,

      guest: isGuest
        ? {
            name: data.guest.name,
            email: data.guest.email,
            phone: data.guest.phone,
            deliveryAddress: data.guest.deliveryAddress
          }
        : null
    });

    // 3) Construire infos client pour la fiche (connecté ou invité)
    let customerName = "";
    let customerEmail = "";
    let customerPhone = "";
    let deliveryAddress = created.deliveryAddress || "";

    if (created.guest?.email) {
      customerName = created.guest.name;
      customerEmail = created.guest.email;
      customerPhone = created.guest.phone;
      deliveryAddress = created.guest.deliveryAddress || deliveryAddress;
    } else if (created.userId) {
      const user = await User.findById(created.userId).select("name email phone address");
      customerName = user?.name || "";
      customerEmail = user?.email || "";
      customerPhone = created.contactPhone || user?.phone || "";
      deliveryAddress = created.deliveryAddress || user?.address || "";
    }

    const orderForMail = {
      orderCode: created.orderCode,
      createdAt: created.createdAt,
      status: created.status,
      items: created.items,
      totalItems: created.totalItems,
      totalPrice: created.totalPrice,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress
    };

    const text = buildOrderText(orderForMail);

    // 4) ENVOI EMAIL (try/catch intégré)
    try {
  // a) Tous les admins reçoivent la fiche (1 seul email en BCC)
  const admins = await User.find({ isAdmin: true }).select("email");
  const adminEmails = admins
    .map((a) => (a.email || "").trim().toLowerCase())
    .filter(Boolean);

  const uniqueAdminEmails = Array.from(new Set(adminEmails));

  if (uniqueAdminEmails.length > 0) {
    await sendMail({
      // "to" obligatoire en SMTP : on met l'expéditeur
      to: process.env.SMTP_USER,
      bcc: uniqueAdminEmails,
      subject: `Nouvelle commande ${created.orderCode}`,
      text
    });
  }

  // b) Le client reçoit la fiche (même invité)
  if (customerEmail) {
    await sendMail({
      to: customerEmail,
      subject: `Votre commande ${created.orderCode} - my-ecommerce`,
      text
    });
  }
} catch (mailErr) {
  console.error("Email non envoyé (mais commande OK):", mailErr);
}

    return NextResponse.json({
      ok: true,
      orderId: created._id.toString(),
      orderCode: created.orderCode
    });
  } catch (err) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}