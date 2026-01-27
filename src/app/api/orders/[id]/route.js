import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sanitize from 'mongo-sanitize';
import { sendOrderMail } from "@/services/mail.service"; 
import { sendWhatsAppMessage } from "@/lib/whatsapp"; // ✅ Ajout du service WhatsApp

const nextStatusMap = {
  EFFECTUER: "EN_COURS_DE_LIVRAISON",
  EN_COURS_DE_LIVRAISON: "LIVRER",
  LIVRER: "LIVRER"
};

// --- CONFIGURATION DES NOTIFICATIONS PAR STATUT ---
const statusContent = {
  EN_COURS_DE_LIVRAISON: {
    subject: "🚚 Votre colis est en route !",
    title: "Expédition confirmée",
    body: "Bonne nouvelle ! Votre commande a été remise à notre transporteur et arrive vers vous.",
    color: "#f97316", // Orange Hebron
    whatsapp: "🚀 Bonjour {name}, votre commande {code} est en cours de livraison ! Nos coursiers sont en route." // ✅ Option WhatsApp
  },
  LIVRER: {
    subject: "✅ Votre commande a été livrée",
    title: "Livraison effectuée",
    body: "Votre colis vient d'être livré. Nous espérons que vos articles vous plaisent !",
    color: "#10b981", // Vert succès
    whatsapp: "✅ Bonjour {name}, votre commande {code} a été livrée avec succès. Merci de votre confiance !" // ✅ Option WhatsApp
  }
};

export async function GET(_req, context) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = !!session.user.isAdmin;
  const isOwner = order.userId && order.userId.toString() === session.user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ ok: true, order });
}

export async function PATCH(req, context) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const cleanBody = sanitize(body);
  const requested = cleanBody.status;

  if (!["EFFECTUER", "EN_COURS_DE_LIVRAISON", "LIVRER"].includes(requested)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findById(id);

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.canceledAt) return NextResponse.json({ error: "Commande annulée" }, { status: 400 });

  const allowedNext = nextStatusMap[order.status];
  if (requested !== allowedNext) {
    return NextResponse.json({ error: `Transition vers ${requested} non autorisée.` }, { status: 400 });
  }

  // 1. Mise à jour en base de données
  order.status = requested;
  await order.save();

  // 2. 📧 DÉCLENCHEMENT DES NOTIFICATIONS (Non-bloquant)
  const mailData = statusContent[requested];
  const customerEmail = order.guest?.email || order.email; 
  const customerName = order.guest?.name || "Cher client";
  const customerPhone = order.guest?.phone || order.contactPhone; // ✅ Récupération du téléphone

  if (mailData) {
    // --- ENVOI EMAIL ---
    if (customerEmail) {
      sendOrderMail({
        to: customerEmail,
        subject: mailData.subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background-color: ${mailData.color}; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px; text-transform: uppercase;">${mailData.title}</h1>
            </div>
            <div style="padding: 24px; color: #1e293b;">
              <p>Bonjour <strong>${customerName}</strong>,</p>
              <p>Le statut de votre commande <strong>${order.orderCode}</strong> a évolué :</p>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; font-weight: bold; border: 1px solid #e2e8f0; margin: 20px 0;">
                STATUT ACTUEL : ${requested.replace(/_/g, ' ')}
              </div>
              <p>${mailData.body}</p>
              <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Merci de votre confiance,<br/>L'équipe Hebron Ivoire Shops</p>
            </div>
          </div>
        `
      }).catch(err => console.error("[STATUS_MAIL_ERROR]:", err));
    }

    // --- ENVOI WHATSAPP ---
    if (mailData.whatsapp && customerPhone) {
      const formattedPhone = customerPhone.startsWith("+") ? customerPhone : `+225${customerPhone}`;
      const whatsappMsg = mailData.whatsapp
        .replace("{name}", customerName)
        .replace("{code}", order.orderCode);
      
      sendWhatsAppMessage(formattedPhone, whatsappMsg)
        .catch(err => console.error("[STATUS_WHATSAPP_ERROR]:", err));
    }
  }

  return NextResponse.json({ ok: true, order });
}