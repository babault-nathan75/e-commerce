import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsAppMessage(to, body) {
  // Sécurité : Vérifier si le numéro d'envoi existe
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  if (!fromNumber) {
    console.error("❌ Erreur : TWILIO_WHATSAPP_NUMBER n'est pas défini dans le fichier .env");
    return { success: false, error: "Missing config" };
  }

  try {
    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body: body
    });
    return { success: true };
  } catch (error) {
    console.error("❌ WhatsApp Error detail:", error.message);
    return { success: false, error };
  }
}