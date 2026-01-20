import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Envoie un message WhatsApp via la passerelle Twilio.
 * Inclut un protocole de nettoyage et de formatage automatique des numéros.
 */
export async function sendWhatsAppMessage(to, body) {
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  // 1. Validation de la configuration initiale
  if (!fromNumber || !process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("❌ [CONFIG ERROR] : Identifiants Twilio manquants dans le .env");
    return { success: false, error: "Configuration manquante" };
  }

  // 2. Nettoyage et formatage du numéro (Scrubbing)
  // Supprime tout ce qui n'est pas un chiffre
  let cleanNumber = to.replace(/\D/g, "");

  // Auto-formatage : Ajoute le préfixe international si manquant (ex: Côte d'Ivoire +225)
  // On adapte ici selon votre zone géographique principale.
  if (cleanNumber.length === 10 && !cleanNumber.startsWith("225")) {
    cleanNumber = `225${cleanNumber}`;
  }

  const formattedRecipient = `whatsapp:+${cleanNumber}`;
  const formattedSender = `whatsapp:${fromNumber.startsWith('+') ? fromNumber : '+' + fromNumber}`;

  try {
    const message = await client.messages.create({
      from: formattedSender,
      to: formattedRecipient,
      body: body
    });

    console.log(`✅ [WHATSAPP SENT] : ID ${message.sid} vers ${formattedRecipient}`);
    
    return { 
      success: true, 
      sid: message.sid,
      status: message.status 
    };

  } catch (error) {
    // 3. Gestion granulaire des erreurs Twilio
    // Code 21614 : Numéro non lié à WhatsApp / Code 21408 : Hors zone de couverture
    console.error(`❌ [WHATSAPP ERROR] : ${error.code || 'UNK'} - ${error.message}`);
    
    return { 
      success: false, 
      code: error.code,
      message: error.message 
    };
  }
}