"use server";

import { connectDB } from "@/lib/db";
import { TableBooking } from "@/models/Restaurant";

export async function createTableBooking(formData) {
    try {
        const dateStr = formData.get("date"); // ex: "2026-02-17"
        const timeSlot = formData.get("timeSlot"); // ex: "12:00 - 14:00 (Déjeuner)"

        // ==========================================
        // 🛡️ LOGIQUE DE VÉRIFICATION DU TEMPS
        // ==========================================
        const now = new Date(); // Heure et date actuelles
        const bookingDate = new Date(dateStr);
        
        // On crée une date "Aujourd'hui" bloquée à minuit pour comparer juste les jours
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);

        // 1. Bloquer les dates passées
        if (bookingDate < today) {
            return { success: false, error: "Vous ne pouvez pas réserver à une date passée." };
        }

        // 2. Si la réservation est pour AUJOURD'HUI, on vérifie les heures
        if (bookingDate.getTime() === today.getTime()) {
            
            // On extrait l'heure de début (ex: "12" ou "19" depuis "12:00 - 14:00...")
            const startHour = parseInt(timeSlot.substring(0, 2), 10);
            const currentHour = now.getHours();
            
            // On définit un délai de prévenance (ex: 2 heures à l'avance)
            const DELAI_PREVENANCE = 2; 

            // Règle A : L'horaire est déjà passé
            if (startHour <= currentHour) {
                return { success: false, error: "Désolé, cet horaire est déjà passé pour aujourd'hui." };
            }

            // Règle B : C'est trop proche de l'heure actuelle
            if (startHour < (currentHour + DELAI_PREVENANCE)) {
                return { 
                    success: false, 
                    error: `Pour aujourd'hui, veuillez réserver au moins ${DELAI_PREVENANCE} heures à l'avance afin que nous puissions préparer votre table.` 
                };
            }
        }
        // ==========================================

        // Si tout est bon, on connecte la base de données et on sauvegarde
        await connectDB();
        
        const bookingCode = `TBL-${Date.now().toString().slice(-5)}`;
        
        const booking = new TableBooking({
            restaurant: formData.get("restaurant"),
            bookingCode,
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            date: new Date(dateStr),
            timeSlot: timeSlot,
            guests: Number(formData.get("guests")),
            status: "EN_ATTENTE"
        });

        await booking.save();

        return { success: true, code: bookingCode };

    } catch (error) {
        console.error("Booking Error:", error);
        return { success: false, error: "Une erreur est survenue lors de la réservation." };
    }
}