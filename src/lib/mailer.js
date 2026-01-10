import nodemailer from "nodemailer";

// 1. Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Ou ton hôte (ex: "smtp.hostinger.com")
  auth: {
    user: process.env.EMAIL_USER, // Ton adresse email
    pass: process.env.EMAIL_PASS, // Ton "Mot de passe d'application" (16 caractères)
  },
});

/* ===============================
    TEXTE DE COMMANDE (Version HTML)
================================ */
export function buildOrderHTML(order) {
  const itemsHtml = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${i.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">x${i.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(i.price * i.quantity).toLocaleString()} FCFA</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #16a34a; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Confirmation de Commande</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Code : ${order.orderCode}</p>
      </div>
      <div style="padding: 20px;">
        <p>Bonjour <strong>${order.customerName}</strong>,</p>
        <p>Votre commande a été enregistrée avec succès. Voici un récapitulatif :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Produit</th>
              <th style="padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Qté</th>
              <th style="text-align: right; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Prix</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
          Total : <span style="color: #f97316;">${order.totalPrice.toLocaleString()} FCFA</span>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 14px;">
          <strong style="display: block; margin-bottom: 5px;">Adresse de livraison :</strong>
          ${order.deliveryAddress || "Retrait en magasin"}<br/>
          <strong>📞 :</strong> ${order.customerPhone || "-"}
        </div>
      </div>
    </div>`;
}

export function buildOrderText(order) {
  return `Commande : ${order.orderCode}\nTotal : ${order.totalPrice} FCFA\nLivraison : ${order.deliveryAddress}`;
}

/* ===============================
    EMAIL COMMANDE (CLIENT + ADMINS)
================================ */
export async function sendOrderEmail({
  to,
  bcc,
  subject,
  html,
  text,
  pdfBuffer,
  filename = "facture.pdf"
}) {
  try {
    const mailOptions = {
      from: `"Ma Boutique" <${process.env.EMAIL_USER}>`,
      to,
      bcc,
      subject,
      text,
      html,
      attachments: []
    };

    // Nodemailer gère les Buffers directement dans la propriété 'content'
    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [Nodemailer] Email envoyé :", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ [Nodemailer Error] :", error);
    throw error;
  }
}