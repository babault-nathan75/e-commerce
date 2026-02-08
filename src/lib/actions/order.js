"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendOrderEmails, sendPickupReadyEmail } from "@/lib/mailer"; 

/**
 * PROTOCOLE 1 : CRÉATION DE COMMANDE
 */
export async function createOrder(formData) {
  try {
    await connectDB();

    // 1. EXTRACTION & NETTOYAGE
    const rawItems = formData.get("items");
    const items = rawItems ? JSON.parse(rawItems) : [];
    const rawDeliveryMethod = formData.get("deliveryMethod"); 
    const deliveryMethod = rawDeliveryMethod ? rawDeliveryMethod.toUpperCase() : "LIVRAISON"; // Sécurité Majuscules
    
    const orderCode = `CMD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    let paymentProofUrl = null;
    let guestData = null;
    let userId = null;

    // GESTION FICHIER (Pour Retrait)
    if (deliveryMethod === "RETRAIT") {
      const file = formData.get("paymentProof");
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `proof-${orderCode}-${Date.now()}.jpg`;
        const uploadDir = path.join(process.cwd(), "public/uploads/proofs");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        paymentProofUrl = `/uploads/proofs/${filename}`;
      }
    }

    if (formData.has("guest")) guestData = JSON.parse(formData.get("guest"));

    // Calculs (Avec sécurité Number)
    const totalItems = items.reduce((acc, item) => acc + Number(item.quantity), 0);
    const totalPrice = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

    const newOrder = new Order({
      orderCode,
      items,
      totalItems,
      totalPrice,
      userId, 
      guest: guestData,
      deliveryAddress: formData.get("deliveryAddress"),
      contactPhone: formData.get("contactPhone"),
      deliveryMethod,
      paymentProofUrl,
      paymentStatus: deliveryMethod === "RETRAIT" ? "EN_ATTENTE" : "NON_REQUIS",
      status: "EFFECTUER"
    });

    // ====================================================
    // 🔴 ZONE CRITIQUE : DÉCRÉMENTATION STOCK (LIVRAISON)
    // ====================================================
    if (deliveryMethod === "LIVRAISON") {
        console.log(`[DEBUG STOCK] Mode LIVRAISON détecté. Début décrémentation...`);
        
        for (const item of items) {
            const qtyToDeduct = Number(item.quantity); // Conversion forcée en Nombre

            const updatedProduct = await Product.findByIdAndUpdate(
                item.productId, 
                { $inc: { stockAvailable: -qtyToDeduct } }, // On soustrait le nombre
                { new: true } // Pour voir le résultat dans le log
            );

            if (updatedProduct) {
                console.log(`✅ [STOCK] ${item.name}: Stock passé à ${updatedProduct.stockAvailable}`);
            } else {
                console.error(`❌ [STOCK ERREUR] Produit introuvable ID: ${item.productId}`);
            }
        }
    } else {
        console.log(`[DEBUG STOCK] Mode RETRAIT détecté. Pas de décrémentation immédiate.`);
    }

    await newOrder.save();

    // Emails (Non bloquant)
    try { await sendOrderEmails(newOrder); } catch (e) { console.error("Erreur Mail:", e.message); }

    revalidatePath("/shop");
    return { success: true, orderCode };

  } catch (error) {
    console.error("[CREATE ORDER ERROR]", error);
    return { success: false, error: error.message };
  }
}

/**
 * PROTOCOLE 2 : VALIDATION DU PAIEMENT (ET DÉCRÉMENTATION RETARDÉE)
 */
export async function verifyPayment(orderId) {
  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Commande introuvable");

    console.log(`[VALIDATION] Traitement Admin pour ${order.orderCode}`);

    // 1. DÉCRÉMENTATION
    for (const item of order.items) {
        const qtyToDeduct = Number(item.quantity);

        // A. Vérif Stock
        const checkProduct = await Product.findById(item.productId);
        if (!checkProduct) throw new Error(`Produit introuvable : ${item.name}`);
        
        if (checkProduct.stockAvailable < qtyToDeduct) {
            return { 
                success: false, 
                error: `Stock insuffisant pour "${item.name}". Requis: ${qtyToDeduct}, Dispo: ${checkProduct.stockAvailable}` 
            };
        }

        // B. Action (-qty)
        const updatedProduct = await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stockAvailable: -qtyToDeduct } },
            { new: true }
        );
        
        console.log(`✅ [VALIDATION STOCK] ${item.name} décrémenté. Reste: ${updatedProduct.stockAvailable}`);
    }

    // 2. STATUTS
    order.paymentStatus = "VALIDE";
    order.status = "PRET_POUR_RETRAIT"; 
    await order.save();
    
    // 3. MAIL CLIENT
    if (order.guest?.email) {
        try { await sendPickupReadyEmail(order); } catch (e) { console.error(e); }
    }
    
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/shop"); 
    
    return { success: true, msg: "Validé et Stock mis à jour !" };

  } catch (error) {
    console.error("[VERIFY PAYMENT ERROR]", error);
    return { success: false, error: error.message };
  }
}

// ... confirmDelivery reste identique ...
export async function confirmDelivery(orderId) {
  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Commande introuvable");
    if (order.status === "LIVRER") throw new Error("Déjà livrée");

    order.status = "LIVRER"; 
    order.deliveredAt = new Date();
    if (order.paymentStatus === "NON_REQUIS") order.paymentStatus = "VALIDE";

    await order.save();
    revalidatePath("/shop");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, deliveredAt: order.deliveredAt.toISOString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}