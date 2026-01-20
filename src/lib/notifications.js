import nodemailer from "nodemailer";
import twilio from "twilio";

// --- CONFIGURATION DES FLUX SORTANTS ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true, // Optimisation : réutilise la connexion pour les envois groupés
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * PROTOCOLE : Scrutateur de Numéros (Spécifique Côte d'Ivoire)
 * Assure le formatage +225 requis par Twilio.
 */
const formatPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && !cleaned.startsWith("225")) {
    return `+225${cleaned}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

/**
 * DISPATCHER : Centre de Notifications Multi-Canal
 */
export async function sendOrderNotifications(order, customer, admins) {
  const shortId = order._id.toString().slice(-6).toUpperCase();
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(order.totalPrice);
  
  console.log(`[NOTIF SYSTEM] : Initialisation du protocole pour l'ordre #${shortId}`);

  // 1. DÉFINITION DES MISSIONS (TASKS)
  const tasks = [];

  // --- FLUX CLIENT ---
  // Mail Hebron Style
  tasks.push(transporter.sendMail({
    from: `"HEBRON IVOIRE SHOPS" <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: `[CONFIRMATION] Commande #${shortId}`,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #232f3e; padding: 20px; text-align: center; border-bottom: 4px solid #f97316;">
          <h1 style="color: white; margin: 0; font-size: 18px; text-transform: uppercase;">Hebron Terminal</h1>
        </div>
        <div style="padding: 20px; color: #1e293b;">
          <p>Bonjour <strong>${customer.name}</strong>,</p>
          <p>Votre ordre de mission <strong>#${shortId}</strong> est validé.</p>
          <p style="font-size: 20px; font-weight: bold; color: #f97316;">Total : ${formattedPrice} FCFA</p>
        </div>
      </div>
    `,
  }));

  // WhatsApp Client
  tasks.push(twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${formatPhone(customer.phone)}`,
    body: `📦 *HEBRON IVOIRE*\nBonjour ${customer.name}, votre commande #${shortId} est confirmée.\nValeur : ${formattedPrice} FCFA.\nNos unités logistiques préparent votre colis.`,
  }));

  // --- FLUX ADMINISTRATEURS (Diffusion parallélisée) ---
  admins.forEach(admin => {
    if (admin.email) {
      tasks.push(transporter.sendMail({
        from: '"ALERTE SYSTÈME HEBRON" <system@hebronivoire.ci>',
        to: admin.email,
        subject: `🚨 NOUVEL ORDRE : #${shortId}`,
        text: `Nouvelle commande de ${customer.name}. Montant: ${formattedPrice} FCFA. Vérifiez le terminal admin.`,
      }));
    }

    if (admin.phone) {
      tasks.push(twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formatPhone(admin.phone)}`,
        body: `🚨 *ALERTE ADMIN*\nNouvelle commande reçue !\nID : #${shortId}\nClient : ${customer.name}\nTotal : ${formattedPrice} FCFA`,
      }));
    }
  });

  // 2. EXÉCUTION DU DISPATCHING
  // Promise.allSettled garantit que si WhatsApp échoue, le Mail part quand même.
  const results = await Promise.allSettled(tasks);

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`[NOTIF SYSTEM] : ${failures.length} échecs de transmission détectés.`);
    failures.forEach(f => console.error(`Détail : ${f.reason}`));
  } else {
    console.log(`[NOTIF SYSTEM] : Diffusion complète réussie.`);
  }

  return { 
    success: failures.length === 0, 
    totalTasks: tasks.length, 
    failedTasks: failures.length 
  };
}