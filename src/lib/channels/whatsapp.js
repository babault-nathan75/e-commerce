import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp({ phones, order }) {
  const message = `
🛒 *Nouvelle commande*
Code : *${order.orderCode}*
Total : *${order.totalPrice} FCFA*

Merci pour votre confiance 🙏
`;

  for (const phone of phones) {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: message
    });
  }
}
