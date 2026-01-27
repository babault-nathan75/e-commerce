import nodemailer from "nodemailer";

/**
 * CONFIGURATION DU TRANSPORTEUR
 * Utilise les variables d'environnement pour la sécurité.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "465"),
  secure: true, // true pour le port 465, false pour les autres
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * SERVICE D'ENVOI D'EMAILS HEBRON
 * @param {string} to - Destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Corps du message en HTML
 * @param {string} pdfPath - (Optionnel) Chemin vers la facture PDF
 */
export async function sendOrderMail({ to, subject, html, pdfPath = null }) {
  try {
    const mailOptions = {
      from: `"Hebron Ivoire Shops" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments: []
    };

    // Ajout de la pièce jointe si elle existe
    if (pdfPath) {
      mailOptions.attachments.push({
        filename: `facture-${new Date().getTime()}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL-SERVICE] Email envoyé : ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("[MAIL-SERVICE-ERROR] Échec de l'envoi :", error);
    throw new Error("Impossible d'envoyer l'email.");
  }
}

/**
 * NOTIFICATION D'ÉVOLUTION DE COMMANDE
 */
export async function sendStatusUpdateMail({ to, orderCode, customerName, newStatus }) {
  const statusConfig = {
    'EN_COURS_DE_LIVRAISON': {
      subject: `🚚 Votre commande ${orderCode} est en cours de livraison !`,
      title: "Colis en route",
      message: "Bonne nouvelle ! Votre colis a été remis à notre transporteur et arrive vers vous.",
      color: "#3b82f6"
    },
    'LIVRER': {
      subject: `✅ Commande ${orderCode} livrée`,
      title: "Livraison effectuée",
      message: "Votre commande a bien été livrée. Nous espérons que vos articles vous plaisent !",
      color: "#10b981"
    },
    // 'ANNULER': {
    //   subject: `❌ Commande ${orderCode} annulée`,
    //   title: "Annulation confirmée",
    //   message: "Votre commande a été annulée. Si vous avez des questions, contactez notre support.",
    //   color: "#ef4444"
    // }
  };

  const config = statusConfig[newStatus];
  if (!config) return; // Si le statut n'a pas de mail dédié, on s'arrête

  return await sendOrderMail({
    to,
    subject: config.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
        <h2 style="color: ${config.color};">${config.title}</h2>
        <p>Bonjour <strong>${customerName}</strong>,</p>
        <p>Le statut de votre commande <strong>${orderCode}</strong> a évolué :</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 10px; text-align: center; font-weight: bold; font-size: 1.1em; color: ${config.color}; border: 1px solid ${config.color}33;">
          ${newStatus.replace(/_/g, ' ')}
        </div>
        <p style="margin-top: 20px;">${config.message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #999;">Hebron Ivoire Shops - Opérations Terminal</p>
      </div>
    `
  });
}