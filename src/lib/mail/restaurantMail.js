import nodemailer from "nodemailer";

// --- CONFIGURATION DU TRANSPORTEUR ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérification au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ ERREUR CONNEXION SMTP (Restaurant) :", error);
  } else {
    console.log("✅ Serveur Mail Restaurant prêt.");
  }
});

/* ============================================================
    HELPER COMMUN : GÉNÉRER LA LISTE DES PLATS (HTML)
   ============================================================ */
// Remplace ta fonction generateMenuItems par celle-ci :
function generateMenuItems(items) {
    if (!items || items.length === 0) return "<tr><td colspan='3' style='padding:10px; text-align:center; color:#94a3b8;'>Aucun plat pré-commandé</td></tr>";
    
    return items.map((i) => {
      // 🛠️ Sécurité : On supporte quantity (nouveau) et qty (ancien)
      const qte = i.quantity || i.qty || 0; 
      const totalLigne = (Number(i.price) * Number(qte));

      return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 14px; color: #1e293b;">${i.name}</td>
        <td style="padding: 10px; font-size: 14px; color: #64748b; text-align: center;">x${qte}</td>
        <td style="padding: 10px; font-size: 14px; color: #0f172a; text-align: right; font-weight: bold;">
          ${totalLigne.toLocaleString('fr-FR')} FCFA
        </td>
      </tr>`;
    }).join("");
}
/* ============================================================
    SECTION 1 : COMMANDE DE REPAS (LIVRAISON)
   ============================================================ */

export function buildFoodOrderClientHTML(order, restaurantName) {
  const themeColor = order.restaurant === "hebron" ? "#ea580c" : "#9333ea";

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${themeColor}; padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; text-transform: uppercase;">
            Preuve de paiement reçue
          </h1>
          <p style="margin: 5px 0 0; color: #ffffff; opacity: 0.8; font-size: 14px;">${restaurantName}</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #1e293b;">Bonjour <strong>${order.customerName || order.name}</strong>,</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Nous avons bien reçu votre commande et votre preuve de paiement. Notre équipe la vérifie actuellement.<br>
            Dès validation, la cuisine lancera la préparation !
          </p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Code de suivi</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: ${themeColor}; font-family: monospace;">${order.orderCode}</p>
          </div>

          <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; font-size: 16px;">Détail de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${generateMenuItems(order.items)}
          </table>
          <p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px;">
            Total : <span style="color: ${themeColor};">${Number(order.totalAmount).toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
      </div>
    </div>`;
}

export function buildFoodOrderAdminHTML(order, restaurantName) {
  const dashboardUrl = process.env.NEXT_PUBLIC_URL || "https://hebronivoireshops.com";
  const adminLink = `${dashboardUrl}/admin/gastronomie`;
  
  const rawUrl = order.paymentProofUrl || "";
  const imageUrl = rawUrl.startsWith('http') ? rawUrl : `${dashboardUrl}${rawUrl}`;

  return `
    <div style="background-color: #f1f5f9; padding: 30px 10px; font-family: 'Courier New', Courier, monospace;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 2px solid #ea580c; border-radius: 5px;">
        
        <div style="background-color: #ea580c; color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">⚠️ LIVRAISON : PAIEMENT À VÉRIFIER</h2>
          <p style="margin: 5px 0 0; font-weight: bold;">Lieu : ${restaurantName}</p>
        </div>

        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${adminLink}" style="background-color: #22c55e; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
              OUVRIR LE TABLEAU DE BORD
            </a>
          </div>

          <ul style="list-style: none; padding: 0; background: #f8fafc; padding: 15px; border-radius: 5px;">
            <li style="margin-bottom: 5px;"><strong>Client :</strong> ${order.customerName || order.name}</li>
            <li style="margin-bottom: 5px;"><strong>Téléphone :</strong> ${order.customerPhone || order.phone}</li>
            <li style="margin-bottom: 5px;"><strong>Email :</strong> ${order.customerEmail || order.email}</li>
            <li><strong>Adresse :</strong> ${order.deliveryAddress}</li>
          </ul>

          <h3 style="color: #475569; text-transform: uppercase; font-size: 14px; border-left: 4px solid #cbd5e1; padding-left: 10px; margin-top: 20px;">🛒 Commande (Réf: ${order.orderCode})</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; margin-bottom: 10px;">
            ${generateMenuItems(order.items)}
          </table>
          <p style="text-align: right; font-size: 16px; font-weight: bold;">
            TOTAL DÉCLARÉ : <span style="color: #ea580c;">${Number(order.totalAmount).toLocaleString('fr-FR')} FCFA</span>
          </p>

          <h3 style="color: #475569; text-transform: uppercase; font-size: 14px; border-left: 4px solid #cbd5e1; padding-left: 10px; margin-top: 20px;">📸 Preuve de paiement</h3>
          <div style="text-align: center; background: #f8fafc; padding: 10px; border: 1px dashed #cbd5e1;">
             <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Vérifiez que le montant sur l'image correspond au total ci-dessus.</p>
             <a href="${imageUrl}" target="_blank">
                <img src="${imageUrl}" alt="Preuve de paiement" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;"/>
             </a>
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
    SECTION 2 : RÉSERVATION DE TABLE (+ PRÉ-COMMANDE)
   ============================================================ */

export function buildClientBookingHTML(booking, restaurantName) {
  const themeColor = booking.restaurant === "hebron" ? "#ea580c" : "#9333ea";

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${themeColor}; padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; text-transform: uppercase;">
            Demande de Réservation Reçue
          </h1>
          <p style="margin: 5px 0 0; color: #ffffff; opacity: 0.8; font-size: 14px;">${restaurantName}</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #1e293b;">Bonjour <strong>${booking.name}</strong>,</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Nous avons bien reçu votre demande de table ainsi que votre pré-commande. 
            Nous vérifions votre paiement et votre table sera réservée sous peu.
          </p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <p style="font-weight:bold; margin-bottom:10px; text-transform:uppercase; font-size:12px; color:#64748b;">Détails de la table</p>
            <ul style="list-style: none; padding: 0; margin: 0; color: #334155; font-weight: bold;">
              <li>📅 ${new Date(booking.date).toLocaleDateString('fr-FR')} à ${booking.timeSlot}</li>
              <li>👥 ${booking.guests} Personne(s)</li>
              <li>🎫 Code: ${booking.bookingCode}</li>
            </ul>
          </div>

          <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Votre Menu Pré-commandé</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${generateMenuItems(booking.items)}
          </table>
          <p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px;">
            Total réglé : <span style="color: ${themeColor};">${Number(booking.totalAmount).toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
      </div>
    </div>`;
}

export function buildAdminBookingHTML(booking, restaurantName) {
  const dashboardUrl = process.env.NEXT_PUBLIC_URL || "https://hebronivoireshops.com";
  const adminLink = `${dashboardUrl}/admin/reservations`;
  
  const rawUrl = booking.paymentProofUrl || "";
  const imageUrl = rawUrl.startsWith('http') ? rawUrl : `${dashboardUrl}${rawUrl}`;

  return `
    <div style="background-color: #f1f5f9; padding: 30px 10px; font-family: 'Courier New', Courier, monospace;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 2px solid #0f172a; border-radius: 5px;">
        
        <div style="background-color: #0f172a; color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">🍽️ NOUVELLE RÉSERVATION (AVEC REPAS)</h2>
          <p style="margin: 5px 0 0; font-weight: bold;">Lieu : ${restaurantName}</p>
        </div>

        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
             <a href="${adminLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">VOIR DANS L'ADMIN</a>
          </div>

          <ul style="list-style: none; padding: 0; background: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <li><strong>Client :</strong> ${booking.name}</li>
            <li><strong>Téléphone :</strong> ${booking.phone}</li>
            <li><strong>Date :</strong> ${new Date(booking.date).toLocaleDateString('fr-FR')}</li>
            <li><strong>Heure :</strong> ${booking.timeSlot}</li>
            <li><strong>Couverts :</strong> ${booking.guests}</li>
          </ul>

          <h3 style="margin-top:20px; border-bottom:1px dashed #ccc;">Menu choisi</h3>
          <table style="width: 100%; margin-bottom: 10px;">
            ${generateMenuItems(booking.items)}
          </table>
          <p style="text-align: right; font-weight: bold;">TOTAL : ${Number(booking.totalAmount).toLocaleString('fr-FR')} FCFA</p>

          <h3 style="margin-top:20px; border-bottom:1px dashed #ccc;">Preuve de paiement</h3>
          <a href="${imageUrl}" target="_blank">
             <img src="${imageUrl}" alt="Preuve" style="max-width: 100%; height: auto; border: 1px solid #ddd; margin-top: 10px;"/>
          </a>
        </div>
      </div>
    </div>`;
}

export function buildStatusUpdateHTML(order, newStatus) {
  const themeColor = order.restaurant === "hebron" ? "#ea580c" : "#9333ea";
  let title = "";
  let message = "";
  let icon = "";

  switch (newStatus) {
    case "PREPARATION":
      title = "Paiement Validé !";
      message = "Bonne nouvelle ! Nous avons reçu votre paiement. La cuisine commence la préparation de votre commande dès maintenant.";
      icon = "🍳";
      break;
    case "EN_LIVRAISON":
      title = "En route !";
      message = "Votre commande vient d'être confiée à notre livreur. Elle arrive vers vous très bientôt !";
      icon = "🛵";
      break;
    case "LIVREE":
      title = "Bon Appétit !";
      message = "Votre commande a été livrée. Merci de votre confiance et à très bientôt chez nous !";
      icon = "😋";
      break;
    case "ANNULEE":
      title = "Commande Annulée";
      message = "Votre commande a été annulée. Si c'est une erreur, contactez-nous rapidement.";
      icon = "❌";
      break;
    default:
      return null;
  }

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${themeColor}; padding: 30px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase;">
            ${title}
          </h1>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #1e293b;">Bonjour <strong>${order.customerName || order.name}</strong>,</p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 20px 0;">
            ${message}
          </p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Code de commande</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: 900; color: ${themeColor}; font-family: monospace;">${order.orderCode}</p>
          </div>
        </div>
      </div>
    </div>`;
}

export function buildBookingStatusEmail(booking, status, restaurantName) {
  const themeColor = booking.restaurant === "hebron" ? "#ea580c" : "#9333ea";
  let title = status === "CONFIRMEE" ? "Réservation Confirmée !" : "Réservation Annulée";
  let message = status === "CONFIRMEE" 
    ? "Excellente nouvelle ! Votre réservation a été validée par notre équipe. Votre table vous attend." 
    : "Votre réservation n'a pas pu être validée. Veuillez nous contacter pour plus d'informations.";
  let icon = status === "CONFIRMEE" ? "✅" : "❌";

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${themeColor}; padding: 30px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase;">${title}</h1>
          <p style="margin: 5px 0 0; color: #ffffff; opacity: 0.8; font-size: 14px;">${restaurantName}</p>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #1e293b;">Bonjour <strong>${booking.name}</strong>,</p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 20px 0;">${message}</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: left;">
             <ul style="list-style: none; padding: 0; margin: 0; color: #334155; font-weight: bold;">
              <li style="margin-bottom: 10px;">📅 ${new Date(booking.date).toLocaleDateString('fr-FR')}</li>
              <li style="margin-bottom: 10px;">⏰ ${booking.timeSlot}</li>
              <li>👥 ${booking.guests} Personnes</li>
            </ul>
          </div>
          
          <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
            En cas de retard ou d'empêchement, merci de nous prévenir.
          </p>
        </div>
      </div>
    </div>`;
}

export async function sendTableEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"HEBRON GASTRONOMIE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error(`❌ [MAIL ERROR] Échec vers ${to}:`, error.message);
    throw error;
  }
}