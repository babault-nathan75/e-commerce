import { sendOrderMail } from "./mail.service";
import { sendWhatsApp } from "./whatsapp.service";
import { generateOrderPDF } from "./pdf.service";

/**
 * PROTOCOLE : Dispatcher de Notifications Hebron
 * Coordonne la génération de documents et la transmission multi-canal.
 */
export async function notifyOrder({ order, admins }) {
  console.log(`[DISPATCHER] : Initialisation du protocole pour l'ordre ${order.orderCode}...`);

  try {
    // 1. GÉNÉRATION DU DOCUMENT DE RÉFÉRENCE (PDF)
    const pdfPath = await generateOrderPDF(order);
    console.log(`[DISPATCHER] : Document PDF généré avec succès.`);

    // 2. PRÉPARATION DES DONNÉES DE TRANSMISSION
    const customerEmail = order.guest?.email || order.userEmail;
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(order.totalPrice);
    
    const message = `
📦 *HEBRON IVOIRE - NOUVEL ORDRE*
-------------------------------
Code : ${order.orderCode}
Client : ${order.guest?.name || "Opérateur Externe"}
Total : ${formattedPrice} FCFA
-------------------------------
_Statut : En attente de traitement_
    `.trim();

    // 3. EXECUTION DU FLUX CLIENT (Prioritaire)
    const customerTasks = [];

    if (order.contactPhone) {
      customerTasks.push(
        sendWhatsApp({
          to: order.contactPhone,
          message: `Merci pour votre confiance. Votre commande ${order.orderCode} est enregistrée.`,
          mediaPath: pdfPath
        })
      );
    }

    if (customerEmail) {
      customerTasks.push(
        sendOrderMail({
          to: customerEmail,
          subject: `Confirmation d'Ordre #${order.orderCode}`,
          html: `<p>Votre commande <strong>${order.orderCode}</strong> a été transmise à nos unités de préparation.</p>`,
          pdfPath
        })
      );
    }

    // 4. EXECUTION DU FLUX ADMINS (Diffusion)
    const adminTasks = admins.flatMap(admin => [
      admin.phone && sendWhatsApp({
        to: admin.phone,
        message: `📢 *ALERTE ADMIN*\n${message}`,
        mediaPath: pdfPath
      }),
      admin.email && sendOrderMail({
        to: admin.email,
        subject: `[ALERTE] Nouvelle Commande - ${order.orderCode}`,
        html: `<p>Une nouvelle commande de ${formattedPrice} FCFA est en attente.</p>`,
        pdfPath
      })
    ]).filter(Boolean);

    // 5. SYNCHRONISATION GLOBALE
    // On utilise allSettled pour que l'échec d'un canal ne bloque pas les autres
    const results = await Promise.allSettled([...customerTasks, ...adminTasks]);

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`[DISPATCHER] WARNING : ${failures.length} transmission(s) ont échoué.`);
    }

    console.log(`[DISPATCHER] : Protocole terminé pour ${order.orderCode}.`);
    return { success: true, pdfPath };

  } catch (error) {
    console.error(`[DISPATCHER] CRITICAL ERROR : Échec total du protocole.`, error);
    throw error;
  }
}