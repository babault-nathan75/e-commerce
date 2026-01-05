import nodemailer from "nodemailer";
import twilio from "twilio";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendOrderNotifications(order, customer, admins) {
  const orderDetails = `Commande #${order._id.toString().slice(-6)} - Total: ${order.totalPrice} FCFA`;

  // --- 1. NOTIFICATIONS CLIENT ---
  // Mail
  await transporter.sendMail({
    from: '"Ma Boutique" <noreply@votre-boutique.com>',
    to: customer.email,
    subject: "Confirmation de votre commande",
    text: `Bonjour ${customer.name}, votre commande est validée ! Détails : ${orderDetails}`,
  });

  // WhatsApp (via Twilio)
  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${customer.phone}`, // Doit être au format +225...
    body: `Bonjour ${customer.name}, votre commande chez [Ma Boutique] est confirmée ! Montant : ${order.totalPrice} FCFA. Merci de votre confiance !`,
  });

  // --- 2. NOTIFICATIONS ADMINS ---
  for (const admin of admins) {
    // Mail Admin
    await transporter.sendMail({
      from: '"Système Alerte" <systeme@votre-boutique.com>',
      to: admin.email,
      subject: "🚨 NOUVELLE COMMANDE",
      text: `Une nouvelle commande vient d'être passée. ${orderDetails}`,
    });

    // WhatsApp Admin
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${admin.phone}`,
      body: `🚨 ALERTE ADMIN : Nouvelle commande reçue !\nClient: ${customer.name}\nMontant: ${order.totalPrice} FCFA\nConsultez le dashboard pour les détails.`,
    });
  }
}