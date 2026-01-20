import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * PROTOCOLE : Diffusion Multi-Destinataire WhatsApp
 * Statut : Transmission de Données Tactiques
 */
export async function sendWhatsApp({ phones, order }) {
  console.log(`[WHATSAPP OPS] : Initialisation de la diffusion pour l'ordre ${order.orderCode}`);

  // 1. FORMATAGE DU MESSAGE (STYLE TERMINAL HEBRON)
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(order.totalPrice);
  
  const message = `
📦 *HEBRON IVOIRE - CONFIRMATION*
-------------------------------
Code Ordre : *${order.orderCode}*
Total : *${formattedPrice} FCFA*
-------------------------------
_Statut : En cours de préparation_
Lien : https://hebronivoire.ci/track/${order.orderCode}

_Merci pour votre confiance._
  `.trim();

  // 2. PRÉPARATION DES MISSIONS DE TRANSMISSION
  const transmissionTasks = phones.map((phone) => {
    // Nettoyage du numéro (Scrubbing Protocol)
    let cleanPhone = phone.replace(/\D/g, "");
    
    // Auto-correction pour l'indicatif Côte d'Ivoire (225)
    if (cleanPhone.length === 10 && !cleanPhone.startsWith("225")) {
      cleanPhone = `225${cleanPhone}`;
    }

    const recipient = `whatsapp:+${cleanPhone}`;

    return client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: recipient,
      body: message
    });
  });

  // 3. EXÉCUTION PARALLÈLE & SYNCHRONISATION
  try {
    const results = await Promise.allSettled(transmissionTasks);

    // Analyse des résultats pour les logs du terminal
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    console.log(`[WHATSAPP OPS] : Diffusion terminée. Succès: ${successCount} | Échecs: ${failureCount}`);

    return {
      success: failureCount === 0,
      total: results.length,
      successCount,
      failureCount
    };
  } catch (error) {
    console.error(`[CRITICAL ERROR] : Échec total de la passerelle WhatsApp`, error.message);
    return { success: false, error: error.message };
  }
}