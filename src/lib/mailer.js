import nodemailer from "nodemailer";

// --- CONFIGURATION DU TRANSPORTEUR TACTIQUE ---
const transporter = nodemailer.createTransport({
  service: "gmail", 
  // Utilisation du pool pour maintenir les connexions lors d'envois groupés (Admin + Client)
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ===============================
    CONSTRUCTION DE L'ORDRE (HTML)
================================ */
export function buildOrderHTML(order) {
  const itemsHtml = order.items
    .map(
      (i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 10px; font-family: 'Helvetica', Arial, sans-serif; font-size: 13px; color: #1e293b; font-weight: bold; text-transform: uppercase;">${i.name}</td>
        <td style="padding: 15px 10px; font-family: 'Helvetica', Arial, sans-serif; font-size: 13px; color: #64748b; text-align: center;">x${i.quantity}</td>
        <td style="padding: 15px 10px; font-family: 'Helvetica', Arial, sans-serif; font-size: 13px; color: #232f3e; text-align: right; font-weight: 900;">${(i.price * i.quantity).toLocaleString()} FCFA</td>
      </tr>`
    )
    .join("");

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Helvetica', Arial, sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <div style="background-color: #232f3e; padding: 30px; text-align: center; border-bottom: 4px solid #f97316;">
          <h1 style="margin: 0; color: #ffffff; font-size: 18px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">Transmission d'Ordre</h1>
          <p style="margin: 8px 0 0; color: #f97316; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Réf : ${order.orderCode}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 14px; color: #475569;">Bonjour <strong style="color: #232f3e;">${order.customerName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Votre commande a été enregistrée dans le système <strong>Hebron Ivoire</strong>. Nos unités logistiques préparent actuellement votre colis.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="text-align: left; padding: 12px 10px; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Module / Unité</th>
                <th style="padding: 12px 10px; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Qté</th>
                <th style="text-align: right; padding: 12px 10px; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; padding: 20px 0; border-top: 2px solid #232f3e;">
            <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Valeur Totale :</span>
            <div style="font-size: 24px; font-weight: 900; color: #f97316;">${order.totalPrice.toLocaleString()} FCFA</div>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <strong style="display: block; font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px;">Coordonnées de livraison :</strong>
            <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: bold; line-height: 1.4;">
              ${order.deliveryAddress || "Retrait Agence - Abidjan"}<br/>
              <span style="color: #f97316; font-size: 12px;">📞 ${order.customerPhone || "N/A"}</span>
            </p>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
            Hebron Ivoire Shops - Session Sécurisée SSL-256<br/>
            Ceci est une notification automatique, merci de ne pas répondre.
          </p>
        </div>
      </div>
    </div>`;
}

export function buildOrderText(order) {
  return `HEBRON IVOIRE - ORDRE ${order.orderCode}\nTotal : ${order.totalPrice.toLocaleString()} FCFA\nDestinataire : ${order.customerName}\nAdresse : ${order.deliveryAddress}`;
}

/* ===============================
    DISPATCHER DE NOTIFICATION
================================ */
export async function sendOrderEmail({
  to,
  bcc,
  subject,
  html,
  text,
  pdfBuffer,
  filename = "facture-hebron.pdf"
}) {
  console.log(`[MAIL SYSTEM] : Initialisation de la transmission vers ${to}...`);

  try {
    const mailOptions = {
      from: `"HEBRON NOTIFICATIONS" <${process.env.EMAIL_USER}>`,
      to,
      bcc,
      subject: `[CONFIRMATION] ${subject}`,
      text,
      html,
      attachments: []
    };

    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [MAIL SYSTEM] : Transmission réussie. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ [MAIL SYSTEM ERROR] : Échec critique de la passerelle SMTP.", error);
    throw error;
  }
}