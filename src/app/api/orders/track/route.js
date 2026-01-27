import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { sendOrderMail } from "@/services/mail.service"; // ✅ Importation du service mail

// --- 1. RÉCUPÉRATION (GET) ---
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const orderCode = (searchParams.get("orderCode") || "").trim();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (!orderCode || !email) {
    return NextResponse.json({ error: "orderCode et email requis" }, { status: 400 });
  }

  const order = await Order.findOne({ orderCode, "guest.email": email });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: {
      orderCode: order.orderCode,
      status: order.status,
      items: order.items,
      totalItems: order.totalItems,
      totalPrice: order.totalPrice,
      name: order.guest?.name || "",
      email: order.guest?.email || "",
      contact: order.guest?.phone || order.contactPhone || "",
      deliveryAddress: order.guest?.deliveryAddress || order.deliveryAddress || "",
      createdAt: order.createdAt,
      canceledAt: order.canceledAt,
      cancelReason: order.cancelReason
    }
  });
}

// --- 2. ANNULATION, STOCK & NOTIFICATION (PUT) ---
export async function PUT(req) {
  try {
    await connectDB();
    const { orderCode, email, reason } = await req.json();

    const order = await Order.findOne({ 
      orderCode, 
      "guest.email": email.toLowerCase().trim() 
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.status === "EN_COURS_DE_LIVRAISON" || order.canceledAt) {
      return NextResponse.json({ error: "Impossible d'annuler une commande déjà en cours de livraison." }, { status: 400 });
    }

    if (order.status === "ANNULER" || order.canceledAt) {
      return NextResponse.json({ error: "Commande déjà annulée." }, { status: 400 });
    }

    if (order.status === "LIVRER") {
      return NextResponse.json({ error: "Impossible d'annuler une commande déjà livrée." }, { status: 400 });
    }

    // 🔄 RÉINTÉGRATION DU STOCK
    const stockOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stockAvailable: item.quantity } },
      },
    }));

    await Product.bulkWrite(stockOps);

    // 📝 MISE À JOUR DE LA COMMANDE
    order.status = "ANNULER";
    order.canceledAt = new Date();
    order.cancelReason = reason || "Annulée par le client";
    await order.save();

    // 📧 NOTIFICATION CLIENT (Fail-Safe)
    try {
      await sendOrderMail({
        to: email,
        subject: `Confirmation d'annulation - Commande ${orderCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #f87171; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Commande Annulée</h2>
            </div>
            <div style="padding: 30px;">
              <p>Bonjour <strong>${order.guest?.name || 'Client'}</strong>,</p>
              <p>Nous vous confirmons que votre commande <strong>${orderCode}</strong> a bien été révoquée et le stock a été mis à jour.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #f87171; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #64748b;">MOTIF DE L'ANNULATION :</p>
                <p style="margin: 5px 0 0 0; font-style: italic;">"${order.cancelReason}"</p>
              </div>

              <p style="font-size: 14px; color: #64748b;">Si cette demande n'émane pas de vous ou si vous avez des questions concernant un éventuel remboursement, veuillez contacter notre support.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              © 2026 Hebron Ivoire Shops - Opérations Terminal
            </div>
          </div>
        `
      });
      console.log(`[MAIL] Notification d'annulation envoyée à ${email}`);
    } catch (mailError) {
      // On log l'erreur mail mais on ne bloque pas la réponse API
      console.error("[MAIL ERROR] Échec de l'envoi du mail d'annulation:", mailError);
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Commande révoquée et mail de confirmation envoyé." 
    });

  } catch (error) {
    console.error("Erreur annulation stock:", error);
    return NextResponse.json({ error: "Erreur protocole lors de l'annulation" }, { status: 500 });
  }
}