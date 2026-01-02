import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ===============================
   TEXTE DE COMMANDE
================================ */
export function buildOrderText(order) {
  return `
Commande : ${order.orderCode}

Client :
Nom : ${order.customerName || "-"}
Email : ${order.customerEmail || "-"}
Téléphone : ${order.customerPhone || "-"}

Articles :
${order.items
  .map(
    (i) =>
      `- ${i.name} x${i.quantity} = ${i.price * i.quantity} FCFA`
  )
  .join("\n")}

Total : ${order.totalPrice} FCFA
Adresse de livraison :
${order.deliveryAddress || "-"}
`;
}

/* ===============================
   EMAIL COMMANDE (CLIENT + ADMINS)
================================ */
export async function sendOrderEmail({
  to,
  bcc,
  subject,
  text,
  pdfBuffer,
  filename = "facture.pdf"
}) {
  const attachments = [];

  // ✅ Sécurité PDF
  if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
    attachments.push({
      filename,
      content: pdfBuffer.toString("base64")
    });
  } else {
    console.warn("⚠️ PDF manquant, envoi email sans pièce jointe");
  }

  return resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    bcc,
    subject,
    text,
    attachments
  });
}
