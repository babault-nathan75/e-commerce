import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product"; // ✅ Importé pour le stock
import { sendOrderMail } from "@/services/mail.service"; // ✅ Importé pour la notification
import sanitize from 'mongo-sanitize';

const CancelSchema = z.object({
  orderCode: z.string().min(3),
  email: z.string().email(),
  cancelReason: z.string().min(5)
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const cleanBody = sanitize(body);
    const data = CancelSchema.parse(cleanBody);

    // 1. Recherche de la commande
    const order = await Order.findOne({
      orderCode: data.orderCode.trim(),
      "guest.email": data.email.trim().toLowerCase()
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 2. Vérifications de sécurité métier
    if (order.status === "LIVRER" || order.status === "EN_COURS_DE_LIVRAISON") {
      return NextResponse.json({ 
        error: "Action impossible : la commande est déjà en cours de traitement logistique." 
      }, { status: 400 });
    }

    if (order.canceledAt) {
      return NextResponse.json({ error: "Cette commande est déjà révoquée." }, { status: 400 });
    }

    // 🔄 3. RÉINTÉGRATION ATOMIQUE DU STOCK
    if (order.items && order.items.length > 0) {
      const stockOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stockAvailable: item.quantity } },
        },
      }));

      await Product.bulkWrite(stockOps);
    }

    // 📝 4. MISE À JOUR DE LA COMMANDE
    order.status = "ANNULER";
    order.cancelReason = data.cancelReason.trim();
    order.canceledAt = new Date();
    order.canceledBy = "USER";
    await order.save();

    // 📧 5. NOTIFICATION D'ANNULATION (Fail-safe)
    try {
      await sendOrderMail({
        to: data.email.trim().toLowerCase(),
        subject: `Annulation confirmée - Commande ${order.orderCode}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background-color: #ef4444; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0; text-transform: uppercase;">Commande Annulée</h2>
            </div>
            <div style="padding: 30px;">
              <p>Bonjour,</p>
              <p>Votre commande <strong>${order.orderCode}</strong> a bien été annulée et les articles ont été remis en stock.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 12px; font-weight: bold; color: #64748b;">MOTIF :</p>
                <p style="margin: 5px 0 0 0;">${order.cancelReason}</p>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Si vous avez déjà été débité, le remboursement sera traité sur votre moyen de paiement initial.</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("[MAIL_ERROR] Échec envoi annulation:", mailErr);
    }

    return NextResponse.json({ ok: true, message: "Commande annulée et stock réintégré." });

  } catch (error) {
    console.error("[CANCEL_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur lors de l'annulation" }, { status: 500 });
  }
}