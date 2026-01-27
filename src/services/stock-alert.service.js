import { User } from "@/models/User";
import { sendWhatsApp } from "./whatsapp.service";
import { sendOrderMail } from "./mail.service";

/**
 * PROTOCOLE D'ALERTE INVENTAIRE
 * Déclenche des notifications si le seuil critique est atteint.
 */
export async function checkStockAlert(product) {
  const stock = Number(product.stock);

  // 1. Définition du seuil (On ne fait rien si stock > 5)
  if (stock > 5) return;

  // 2. Récupération des administrateurs
  const admins = await User.find({ isAdmin: true }).lean();
  if (!admins.length) return;

  // 3. Préparation du message
  const isOut = stock === 0;
  const statusEmoji = isOut ? "🔴" : "⚠️";
  const statusText = isOut ? "RUPTURE TOTALE" : "STOCK CRITIQUE";
  
  const alertMessage = `
${statusEmoji} *ALERTE INVENTAIRE HEBRON*
---------------------------------
Produit : *${product.name}*
Canal : ${product.channel.toUpperCase()}
Stock actuel : *${stock} unité(s)*
Statut : ${statusText}
---------------------------------
_Veuillez réapprovisionner via le tableau de bord admin._
  `.trim();

  // 4. Envoi multi-canal (Fail-safe)
  const alertTasks = admins.flatMap(admin => [
    admin.phone && sendWhatsApp({ to: admin.phone, message: alertMessage }),
    admin.email && sendOrderMail({
      to: admin.email,
      subject: `[${statusText}] ${product.name}`,
      html: `<p>${alertMessage.replace(/\n/g, '<br>')}</p>`
    })
  ]).filter(Boolean);

  await Promise.allSettled(alertTasks);
  console.log(`[STOCK-ALERT] : Alerte envoyée pour ${product.name} (Stock: ${stock})`);
}