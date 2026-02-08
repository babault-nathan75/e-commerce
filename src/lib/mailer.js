import nodemailer from "nodemailer";

// --- CONFIGURATION DU TRANSPORTEUR TACTIQUE ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérification SMTP au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ ERREUR CONNEXION SMTP :", error);
  } else {
    console.log("✅ Serveur Mail prêt.");
  }
});

/* ===============================
    HELPER : GÉNÉRATEUR DE LISTE PRODUITS
    (Utilisé pour Client et Admin)
================================ */
function generateItemsRows(items) {
    return items.map((i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px; color: #1e293b;">${i.name}</td>
        <td style="padding: 10px; font-size: 13px; color: #64748b; text-align: center;">x${i.quantity}</td>
        <td style="padding: 10px; font-size: 13px; color: #232f3e; text-align: right; font-weight: bold;">${(i.price * i.quantity).toLocaleString()} FCFA</td>
      </tr>`
    ).join("");
}

/* ===============================
    TEMPLATE CLIENT (Joli & Rassurant)
================================ */
export function buildOrderHTML(order) {
  const isPickup = order.deliveryMethod === "RETRAIT" || order.isPickup;
  const itemsRows = generateItemsRows(order.items);

  const addressBlock = isPickup 
    ? `<span style="color: #9333ea; font-weight: bold;">🏪 RETRAIT EN BOUTIQUE</span><br/>
       <span style="font-size: 11px; color: #64748b;">Paiement en cours de vérification.</span>`
    : `${order.deliveryAddress || "Adresse non spécifiée"}<br/>
       <span style="color: #f97316; font-size: 12px;">📞 ${order.customerPhone || order.contactPhone || "N/A"}</span>`;

  return `
    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${isPickup ? '#7e22ce' : '#232f3e'}; padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; text-transform: uppercase;">
            ${isPickup ? "Confirmation de Dépôt" : "Commande Reçue"}
          </h1>
          <p style="margin: 5px 0 0; color: #ffffff; opacity: 0.8; font-size: 12px;">Réf : ${order.orderCode}</p>
        </div>
        <div style="padding: 30px;">
          <p>Bonjour <strong>${order.customerName}</strong>,</p>
          <p>Nous avons bien reçu votre commande. ${isPickup ? "Nous vérifions votre preuve de paiement." : "Nous la préparons."}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">${itemsRows}</table>
          <div style="text-align: right; font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 20px;">
            Total : ${order.totalPrice.toLocaleString()} FCFA
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
            ${addressBlock}
          </div>
        </div>
      </div>
    </div>`;
}

/* ===============================
    TEMPLATE ADMIN (Technique & Action)
================================ */
export function buildAdminHTML(order, adminLink) {
    const isPickup = order.deliveryMethod === "RETRAIT" || order.isPickup;
    const itemsRows = generateItemsRows(order.items);

    // Message d'alerte spécifique Admin
    const alertMessage = isPickup 
        ? "⚠️ LE CLIENT ATTEND LA VALIDATION DE SON PAIEMENT (Preuve envoyée)."
        : "📦 NOUVELLE COMMANDE À EXPÉDIER.";

    const alertColor = isPickup ? "#ea580c" : "#0f172a"; // Orange (Urgent) ou Bleu nuit (Standard)

    return `
    <div style="background-color: #f1f5f9; padding: 30px 10px; font-family: 'Courier New', Courier, monospace;">
        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border: 2px solid ${alertColor}; border-radius: 5px;">
            
            <div style="background-color: ${alertColor}; color: white; padding: 15px; text-align: center;">
                <h2 style="margin: 0; font-size: 18px;">${alertMessage}</h2>
                <p style="margin: 5px 0 0; font-weight: bold;">RÉF: ${order.orderCode}</p>
            </div>

            <div style="padding: 20px;">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${adminLink}" style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; display: inline-block; border: 2px solid #16a34a;">
                        ${isPickup ? "🔍 VÉRIFIER LA PREUVE & VALIDER" : "🚀 GÉRER LA LIVRAISON"}
                    </a>
                    <p style="font-size: 11px; color: #64748b; margin-top: 10px;">Cliquez pour accéder au tableau de bord</p>
                </div>

                <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 20px 0;" />

                <h3 style="color: #475569; text-transform: uppercase; font-size: 14px; border-left: 4px solid #cbd5e1; padding-left: 10px;">👤 Fiche Client</h3>
                <ul style="list-style: none; padding: 0; background: #f8fafc; padding: 15px; border-radius: 5px;">
                    <li style="margin-bottom: 5px;"><strong>Nom :</strong> ${order.customerName}</li>
                    <li style="margin-bottom: 5px;"><strong>Email :</strong> <a href="mailto:${order.guest?.email}" style="color: #2563eb;">${order.guest?.email || "Non renseigné"}</a></li>
                    <li style="margin-bottom: 5px;"><strong>Téléphone :</strong> <a href="tel:${order.customerPhone}" style="color: #2563eb; font-weight: bold;">${order.customerPhone}</a></li>
                    <li><strong>Adresse :</strong> ${order.deliveryAddress || "RETRAIT EN BOUTIQUE"}</li>
                </ul>

                <h3 style="color: #475569; text-transform: uppercase; font-size: 14px; border-left: 4px solid #cbd5e1; padding-left: 10px; margin-top: 20px;">🛒 Contenu du Panier</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                    <thead style="background: #e2e8f0;">
                        <tr>
                            <th style="text-align: left; padding: 8px;">Produit</th>
                            <th style="padding: 8px;">Qté</th>
                            <th style="text-align: right; padding: 8px;">Prix</th>
                        </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                </table>
                <p style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 10px;">
                    TOTAL À ENCAISSER : <span style="color: #ea580c;">${order.totalPrice.toLocaleString()} FCFA</span>
                </p>

            </div>
        </div>
    </div>`;
}

export function buildOrderText(order) {
  return `COMMANDE #${order.orderCode} - ${order.totalPrice} FCFA - Client: ${order.customerName}`;
}

/* ===============================
    DISPATCHER D'ENVOI
================================ */
export async function sendOrderEmail({ to, subject, html, text }) {
  console.log(`📨 [MAIL] Envoi en cours vers ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: `"HEBRON NOTIFICATIONS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("✅ [MAIL] Succès. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error(`❌ [MAIL ERROR] Échec vers ${to}:`, error.message);
    throw error;
  }
}

/* ===============================
    ORCHESTRATEUR PRINCIPAL
================================ */
export async function sendOrderEmails(order) {
    // 1. Préparation des données nettoyées
    const cleanOrder = {
        ...order._doc,
        ...order,
        customerName: order.guest?.name || "Client",
        customerPhone: order.guest?.phone || order.contactPhone,
        isPickup: order.deliveryMethod === "RETRAIT"
    };

    const dashboardUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const adminLink = `${dashboardUrl}/admin/orders/${order._id}`;
    const subjectSuffix = cleanOrder.isPickup ? "RETRAIT BOUTIQUE" : "LIVRAISON";

    // --- 2. ENVOI AU CLIENT (Template Client) ---
    if (order.guest?.email) {
        try {
            const clientHtml = buildOrderHTML(cleanOrder);
            await sendOrderEmail({
                to: order.guest.email,
                subject: `Commande #${order.orderCode} - Confirmation`,
                html: clientHtml,
                text: buildOrderText(cleanOrder)
            });
        } catch (e) {
            console.error("⚠️ Erreur envoi client (ignoré):", e.message);
        }
    }

    // --- 3. ENVOI A L'ADMIN (Template Admin Spécifique) ---
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        // On génère le HTML SPÉCIFIQUE ADMIN
        const adminHtml = buildAdminHTML(cleanOrder, adminLink);
        
        // Sujet urgent pour l'admin
        const adminSubject = cleanOrder.isPickup 
            ? `⚠️ ACTION REQUISE : Validation Paiement #${order.orderCode}`
            : `📦 NOUVELLE COMMANDE #${order.orderCode}`;

        try {
            await sendOrderEmail({
                to: adminEmail,
                subject: adminSubject,
                html: adminHtml,
                text: `ACTION REQUISE POUR LA COMMANDE #${order.orderCode}`
            });
        } catch (e) {
            console.error("❌ ERREUR CRITIQUE EMAIL ADMIN:", e.message);
        }
    } else {
        console.error("⛔ ADMIN_EMAIL manquant dans le .env");
    }
}
/* ===============================
    TEMPLATE : COMMANDE PRÊTE (RETRAIT)
================================ */
export function buildPickupReadyHTML(order) {
  return `
    <div style="background-color: #f0fdf4; padding: 40px 10px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #16a34a;">
        
        <div style="background-color: #16a34a; padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">
            🎉 C'EST PRÊT !
          </h1>
          <p style="margin: 5px 0 0; color: #dcfce7; font-size: 14px;">Commande #${order.orderCode}</p>
        </div>

        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
            Bonjour <strong>${order.guest?.name || "Client"}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            Bonne nouvelle ! Nous avons validé votre paiement et préparé votre commande.
            <br/>
            <strong>Vous pouvez passer la récupérer dès maintenant en boutique.</strong>
          </p>

          <div style="background-color: #f1f5f9; padding: 20px; margin: 30px 0; border-radius: 10px; text-align: left;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Rappel des articles :</p>
            <ul style="margin: 0; padding-left: 20px; color: #334155;">
              ${order.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('')}
            </ul>
          </div>

          <div style="border: 2px dashed #16a34a; padding: 15px; border-radius: 8px; background-color: #f0fdf4; display: inline-block;">
            <p style="margin: 0; font-weight: bold; color: #166534;">
              📞 N'oubliez pas votre code : #${order.orderCode}
            </p>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
            Hebron Ivoire Shops - À tout de suite !
          </p>
        </div>
      </div>
    </div>`;
}

/* ===============================
    ENVOI : NOTIFICATION "PRÊT"
================================ */
export async function sendPickupReadyEmail(order) {
  if (!order.guest?.email) return;

  console.log(`🚀 [MAIL] Envoi notification "PRÊT" à ${order.guest.email}`);
  
  const htmlContent = buildPickupReadyHTML(order);
  const textContent = `Bonjour ${order.guest.name}, votre commande #${order.orderCode} est validée et prête à être retirée en boutique !`;

  try {
    await sendOrderEmail({
      to: order.guest.email,
      subject: `✅ C'EST PRÊT ! Votre commande #${order.orderCode} vous attend`,
      html: htmlContent,
      text: textContent
    });
  } catch (error) {
    console.error("❌ Erreur envoi mail Ready:", error);
  }
}