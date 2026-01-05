import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        <p>Bonne nouvelle ! Votre commande a été enregistrée avec succès. Voici un récapitulatif :</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Produit</th>
              <th style="padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Qté</th>
              <th style="text-align: right; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
          Total : <span style="color: #f97316;">${order.totalPrice.toLocaleString()} FCFA</span>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 14px;">
          <strong style="display: block; margin-bottom: 5px;">Adresse de livraison :</strong>
          ${order.deliveryAddress || "Retrait en magasin"}<br/>
          <strong>📞 :</strong> ${order.customerPhone || "-"}
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">
          Vous trouverez votre facture officielle en pièce jointe de cet email.
        </p>
      </div>
    </div>
  `;
}

// On garde aussi la version texte pour les clients mail très anciens
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
  html, // ✅ On reçoit maintenant du HTML
  text,
  pdfBuffer,
  filename = "facture.pdf"
}) {
  const attachments = [];

  if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
    attachments.push({
      filename,
      content: pdfBuffer, // Resend accepte directement le Buffer avec son SDK
    });
  }

  return resend.emails.send({
    from: "Ma Boutique <onboarding@resend.dev>", // Change par ton domaine vérifié plus tard
    to,
    bcc,
    subject,
    text, // Version de secours
    html, // Version riche
    attachments
  });
}