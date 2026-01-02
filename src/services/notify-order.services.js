import { sendOrderMail } from "./mail.service";
import { sendWhatsApp } from "./whatsapp.service";
import { generateOrderPDF } from "./pdf.service";

export async function notifyOrder({ order, admins }) {
  const pdfPath = await generateOrderPDF(order);

  const message = `
🛒 Nouvelle commande
Code: ${order.orderCode}
Total: ${order.totalPrice} FCFA
`;

  // USER
  if (order.contactPhone) {
    await sendWhatsApp({
      to: order.contactPhone,
      message,
      mediaPath: pdfPath
    });
  }

  await sendOrderMail({
    to: order.guest?.email || order.userEmail,
    subject: "Confirmation de commande",
    html: "<p>Merci pour votre commande</p>",
    pdfPath
  });

  // ADMINS
  for (const admin of admins) {
    if (admin.phone) {
      await sendWhatsApp({
        to: admin.phone,
        message,
        mediaPath: pdfPath
      });
    }

    await sendOrderMail({
      to: admin.email,
      subject: "Nouvelle commande reçue",
      html: "<p>Une nouvelle commande a été passée.</p>",
      pdfPath
    });
  }
}
