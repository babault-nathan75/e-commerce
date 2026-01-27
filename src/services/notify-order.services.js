import { sendOrderMail } from "./mail.service";
import { sendWhatsApp } from "./whatsapp.service";
import { generateOrderPDF } from "./pdf.service";

/**
 * HEBRON NOTIFICATION ENGINE v4.2
 * Vision 360° Admin : Coordonnées client, détails financiers et logistiques.
 */
export async function notifyOrder({ order, admins = [] }) {
  const logPrefix = `[ORDER-NOTIFICATION][${order.orderCode}]`;
  let pdfPath = null;

  console.time(logPrefix);

  try {
    // 1. GÉNÉRATION DU DOCUMENT
    pdfPath = await generateOrderPDF(order);

    // 2. PRÉPARATION ET NORMALISATION DES DONNÉES
    const customerEmail = (order.guest?.email || order.userEmail || "Non renseigné").trim();
    const customerPhone = (order.contactPhone || order.guest?.phone || "Non renseigné").trim();
    const customerName = order.guest?.name || order.userName || "Client";
    
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Abidjan'
    });

    const formatPrice = (val) => new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'XOF', minimumFractionDigits: 0
    }).format(val);

    // Génération du résumé enrichi (avec prix unitaires)
    const itemsSummaryHtml = order.items?.map(item => 
      `<li>${item.name} : <strong>${item.quantity}</strong> x ${formatPrice(item.price)} = <strong>${formatPrice(item.price * item.quantity)}</strong></li>`
    ).join('') || "Voir facture PDF jointe";

    const itemsSummaryText = order.items?.map(item => `- ${item.name} (${item.quantity}x ${formatPrice(item.price)})`).join('\n');

    // --- TEMPLATE WHATSAPP ADMIN (COMPLET) ---
    const adminWhatsAppMsg = `
📢 *ALERTE COMMANDE - HEBRON*
---------------------------------
🆔 Code : *${order.orderCode}*
📅 Date : ${orderDate}

👤 *CLIENT :*
- Nom : ${customerName}
- Tél : ${customerPhone}
- Mail : ${customerEmail}

📍 *LIVRAISON :*
${order.shippingAddress || 'Retrait en boutique'}

📦 *PRODUITS :*
${itemsSummaryText}

💰 *TOTAL : ${formatPrice(order.totalPrice)}*
---------------------------------
⚡ _Action requise via le Terminal Admin_
    `.trim();

    const queue = [];

    // 3. FLUX CLIENT (Concis et rassurant)
    if (order.contactPhone) {
      queue.push({
        type: 'WhatsApp-Client',
        task: sendWhatsApp({
          to: order.contactPhone,
          message: `Bonjour ${customerName}, votre commande ${order.orderCode} (${formatPrice(order.totalPrice)}) est confirmée. Merci pour votre confiance !`,
          mediaPath: pdfPath
        })
      });
    }

    // 4. FLUX ADMINS (DÉTAILLÉ POUR GESTION)
    admins.forEach(admin => {
      // WhatsApp Admin
      if (admin.phone) {
        queue.push({
          type: `WhatsApp-Admin-${admin.name}`,
          task: sendWhatsApp({ to: admin.phone, message: adminWhatsAppMsg, mediaPath: pdfPath })
        });
      }
      
      // Email Admin
      if (admin.email) {
        queue.push({
          type: `Email-Admin-${admin.name}`,
          task: sendOrderMail({
            to: admin.email,
            subject: `🚨 ALERTE LOGISTIQUE : Commande ${order.orderCode} (${customerName})`,
            html: `
              <div style="font-family: Arial, sans-serif; border: 1px solid #232f3e; padding: 0; border-radius: 12px; overflow: hidden; max-width: 650px;">
                <div style="background: #232f3e; color: #f97316; padding: 15px; font-weight: bold; text-align: center; text-transform: uppercase;">
                  Nouvelle Transaction Détectée
                </div>
                <div style="padding: 25px;">
                  <h3 style="margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Récapitulatif Ordre #${order.orderCode}</h3>
                  
                  <table style="width: 100%; margin-bottom: 20px; font-size: 14px; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Date :</td><td style="font-weight: bold;">${orderDate}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Client :</td><td style="font-weight: bold;">${customerName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Téléphone :</td><td style="font-weight: bold;"><a href="tel:${customerPhone}" style="color: #f97316;">${customerPhone}</a></td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Email :</td><td style="font-weight: bold;">${customerEmail}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Livraison :</td><td style="color: #f97316; font-weight: bold;">${order.shippingAddress || 'Retrait boutique'}</td></tr>
                  </table>

                  <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #64748b;">Détails des articles :</h4>
                    <ul style="font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      ${itemsSummaryHtml}
                    </ul>
                  </div>

                  <div style="text-align: right; font-size: 1.3em; font-weight: 900; margin-top: 25px; color: #232f3e;">
                    Total : <span style="color: #f97316;">${formatPrice(order.totalPrice)}</span>
                  </div>

                  <div style="margin-top: 35px; text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL}/admin/orders" 
                       style="background: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                       ACCÉDER AU DASHBOARD TERMINAL
                    </a>
                  </div>
                </div>
              </div>
            `,
            pdfPath
          })
        });
      }
    });

    // 5. EXÉCUTION & SYNCHRO
    const results = await Promise.allSettled(queue.map(q => q.task));
    console.timeEnd(logPrefix);
    return { success: true, pdfPath };

  } catch (error) {
    console.error(`${logPrefix} CRITICAL_FAILURE :`, error);
    throw error;
  }
}