import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * PROTOCOLE : Transmission de Données WhatsApp Hebron
 * Envoie des messages tactiques avec support média (PDF/Images).
 */
export async function sendWhatsApp({ to, message, mediaPath }) {
  // 1. FORMATAGE DU NUMÉRO (SCRUBBING PROTOCOL)
  // On s'assure que le numéro commence par '+' et ne contient que des chiffres
  let formattedTo = to.replace(/\D/g, "");
  if (!formattedTo.startsWith("225") && formattedTo.length === 10) {
    // Auto-fix pour les numéros ivoiriens à 10 chiffres sans indicatif
    formattedTo = `225${formattedTo}`;
  }
  const recipient = `whatsapp:+${formattedTo}`;

  // 2. LOGIQUE D'URL MÉDIA (PUBLIC ASSET)
  // Utilisation d'une variable d'env pour le domaine pour éviter le hardcoding
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://votre-domaine.com";
  const mediaUrl = mediaPath 
    ? [`${baseUrl}${mediaPath}`] 
    : undefined;

  try {
    console.log(`[WHATSAPP SYSTEM] : Initialisation de l'envoi vers ${recipient}...`);

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // Format: 'whatsapp:+1415XXXXXXX'
      to: recipient,
      body: message,
      mediaUrl: mediaUrl
    });

    console.log(`[WHATSAPP SYSTEM] : Message transmis. SID: ${response.sid}`);
    return { success: true, sid: response.sid };

  } catch (error) {
    console.error(`[WHATSAPP SYSTEM] ERROR : Échec de transmission.`, {
      code: error.code,
      message: error.message,
      recipient: recipient
    });
    
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code 
    };
  }
}