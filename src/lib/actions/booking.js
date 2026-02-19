"use server";

import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { sendTableEmail, buildClientBookingHTML, buildAdminBookingHTML, buildBookingStatusEmail } from "@/lib/mail/restaurantMail";

// ==========================================
// 1. CRÉER UNE RÉSERVATION (Côté Client)
// ==========================================
export async function createBooking(formData) {
  try {
    console.log("🚀 DÉBUT TRAITEMENT RÉSERVATION...");

    // 🌐 URL de base pour les images dans les emails (localhost en dev, ton domaine en prod)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const file = formData.get("paymentProof");
    const cartStr = formData.get("cart");
    const totalRaw = formData.get("total"); // 🛠️ Nommé totalRaw pour plus de clarté
    const restaurant = formData.get("restaurant");
    
    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const date = formData.get("date");
    const timeSlot = formData.get("timeSlot");
    const guests = formData.get("guests");

    if (!file || file.size === 0) {
      return { success: false, error: "La capture d'écran est obligatoire." };
    }

    // A. Sauvegarde Physique de l'Image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    
    const fileName = `booking_${timestamp}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "bookings");
    
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Chemin pour la BDD (relatif)
    const paymentProofUrl = `/uploads/bookings/${fileName}`;
    // Chemin pour l'Email (absolu)
    const absoluteProofUrl = `${baseUrl}${paymentProofUrl}`;

    // B. Sauvegarde en Base de Données
    await connectDB();
    const bookingCode = `RES-${timestamp.toString().slice(-5)}`;
    
    // 🛠️ SÉCURITÉ : Transformation des données
    let items = [];
    try {
        items = cartStr ? JSON.parse(cartStr) : [];
    } catch (e) {
        console.error("❌ Erreur de lecture du panier (JSON)");
    }

    const bookingData = {
      bookingCode,
      restaurant,
      name,
      phone,
      email: email || null,
      date: new Date(date),
      timeSlot,
      guests: Number(guests) || 1,
      items: items,
      totalAmount: Number(totalRaw) || 0, // 🎯 Enregistre le montant comme un Nombre
      paymentProofUrl: paymentProofUrl, 
    };

    // Création en BDD
    const newBooking = await Booking.create(bookingData);
    console.log("✅ Réservation enregistrée en BDD ID:", newBooking._id);

    // C. Envoi des Emails
    const restaurantName = restaurant === "hebron" ? "Hebron Ivoire" : "Espace Teresa";
    
    try {
        // Données pour l'email (on utilise l'URL absolue pour que l'image s'affiche)
        const emailData = { ...bookingData, paymentProofUrl: absoluteProofUrl };

        // Mail Admin
        if (process.env.ADMIN_EMAIL) {
            await sendTableEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `🍽️ NOUVELLE RÉSERVATION [${bookingCode}]`,
                html: buildAdminBookingHTML(emailData, restaurantName)
            });
        }

        // Mail Client
        if (email) {
            await sendTableEmail({
                to: email,
                subject: `Demande de réservation reçue - ${restaurantName}`,
                html: buildClientBookingHTML(emailData, restaurantName)
            });
        }
    } catch (mailError) {
        console.error("❌ ERREUR ENVOI MAIL :", mailError);
    }

    // 🔄 Rafraîchit la liste côté Admin
    revalidatePath("/admin/reservations");

    return { success: true, bookingCode };

  } catch (error) {
    console.error("❌ ERREUR CRITIQUE createBooking:", error);
    return { success: false, error: "Erreur lors de la réservation." };
  }
}

// ==========================================
// 2. METTRE À JOUR LE STATUT (Côté Admin)
// ==========================================
export async function updateBookingStatus(bookingId, newStatus) {
    try {
        await connectDB();
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status: newStatus },
            { new: true }
        );

        if (!updatedBooking) return { success: false, error: "Réservation introuvable" };

        if ((newStatus === "CONFIRMEE" || newStatus === "ANNULEE") && updatedBooking.email) {
            const restaurantName = updatedBooking.restaurant === "hebron" ? "Hebron Ivoire" : "Espace Teresa";
            const html = buildBookingStatusEmail(updatedBooking, newStatus, restaurantName);
            
            if (html) {
                sendTableEmail({
                    to: updatedBooking.email,
                    subject: newStatus === "CONFIRMEE" ? `✅ Réservation Confirmée - ${restaurantName}` : `❌ Réservation Annulée - ${restaurantName}`,
                    html: html
                }).catch(err => console.error("❌ Erreur envoi mail notification:", err));
            }
        }

        revalidatePath("/admin/reservations");
        return { success: true };
    } catch (error) { 
        console.error("Erreur updateBookingStatus:", error);
        return { success: false, error: "Erreur serveur" }; 
    }
}