"use server";

import { connectDB } from "@/lib/db";
import { FoodOrder } from "@/models/FoodOrder";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
// 👇 IMPORT DES FONCTIONS D'EMAIL
import { sendTableEmail, buildFoodOrderClientHTML, buildFoodOrderAdminHTML, buildStatusUpdateHTML } from "@/lib/mail/restaurantMail";

// ==========================================
// 1. CRÉER UNE COMMANDE (Côté Client)
// ==========================================
export async function createFoodOrder(formData) {
  try {
    // 1. Récupération des données du formulaire
    const file = formData.get("paymentProof");
    const cartStr = formData.get("cart");
    const total = formData.get("total");
    const restaurant = formData.get("restaurant");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email"); // 👈 On récupère l'email
    const address = formData.get("address");

    // Vérification de sécurité
    if (!file || file.size === 0) {
      return { success: false, error: "La capture d'écran est obligatoire." };
    }

    // ==========================================
    // 📁 2. SAUVEGARDE LOCALE DE L'IMAGE
    // ==========================================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `pay_${timestamp}_${Math.floor(Math.random() * 1000)}.${extension}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "restaurant");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const paymentProofUrl = `/uploads/restaurant/${fileName}`;

    // ==========================================
    // 💾 3. SAUVEGARDE DANS MONGODB
    // ==========================================
    await connectDB();
    
    const orderCode = `CMD-${timestamp.toString().slice(-5)}`;
    const items = JSON.parse(cartStr);

    const newOrder = await FoodOrder.create({
      orderCode,
      restaurant,
      customerName: name,
      customerPhone: phone,
      customerEmail: email, // 👈 On sauvegarde l'email en BDD
      deliveryAddress: address,
      items,
      totalAmount: Number(total),
      paymentProofUrl, 
    });

    // ==========================================
    // 📧 4. ENVOI DES EMAILS (En arrière-plan)
    // ==========================================
    const restaurantName = restaurant === "hebron" ? "Hebron Ivoire" : "Espace Teresa";

    // On utilise Promise.resolve() pour ne pas faire attendre l'utilisateur pendant l'envoi
    Promise.resolve().then(async () => {
        try {
            // A. EMAIL ADMIN (Alerte Nouveau Paiement)
            if (process.env.ADMIN_EMAIL) {
                await sendTableEmail({
                    to: process.env.ADMIN_EMAIL,
                    subject: `⚠️ PAIEMENT À VÉRIFIER [${orderCode}] - ${restaurantName}`,
                    html: buildFoodOrderAdminHTML(newOrder, restaurantName)
                });
            }

            // B. EMAIL CLIENT (Confirmation de réception)
            if (email) {
                await sendTableEmail({
                    to: email,
                    subject: `Reçu de commande #${orderCode} - ${restaurantName}`,
                    html: buildFoodOrderClientHTML(newOrder, restaurantName)
                });
            }
        } catch (mailError) {
            console.error("⚠️ Erreur d'envoi d'email (silencieuse):", mailError);
        }
    });

    return { success: true, orderCode: newOrder.orderCode };

  } catch (error) {
    console.error("Erreur createFoodOrder:", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}

// ==========================================
// 2. METTRE À JOUR LE STATUT (Côté Admin)
// ==========================================
export async function updateFoodOrderStatus(orderId, newStatus) {
  try {
    await connectDB();
    
    // 1. On met à jour et on récupère la commande mise à jour (new: true)
    const updatedOrder = await FoodOrder.findByIdAndUpdate(
      orderId, 
      { status: newStatus },
      { new: true } 
    );
    
    if (!updatedOrder) return { success: false, error: "Commande introuvable" };

    // 2. Envoi de l'email au client (si email présent)
    if (updatedOrder.customerEmail) {
        // On génère le HTML spécifique au nouveau statut
        const emailHtml = buildStatusUpdateHTML(updatedOrder, newStatus);
        
        // Si le statut a un template associé (validé, livraison, etc.), on envoie
        if (emailHtml) {
            const subjectMap = {
                "PREPARATION": "Paiement validé ! En cuisine 🍳",
                "EN_LIVRAISON": "Votre commande arrive 🛵",
                "LIVREE": "Bon appétit ! 😋",
                "ANNULEE": "Information sur votre commande ❌"
            };

            // Envoi en arrière-plan (ne bloque pas l'interface admin)
            Promise.resolve().then(async () => {
                try {
                    await sendTableEmail({
                        to: updatedOrder.customerEmail,
                        subject: subjectMap[newStatus] || "Mise à jour de votre commande",
                        html: emailHtml
                    });
                } catch (err) {
                    console.error("Erreur envoi mail statut:", err);
                }
            });
        }
    }
    
    // 3. Rafraîchit la page Admin
    revalidatePath("/admin/gastronomie"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erreur updateFoodOrderStatus:", error);
    return { success: false, error: "Impossible de modifier la commande." };
  }
}