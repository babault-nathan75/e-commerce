"use server";

import { connectDB } from "@/lib/db";
import { TableBooking } from "@/models/Restaurant";

export async function createTableBooking(formData) {
    try {
        await connectDB();
        
        const bookingCode = `TBL-${Date.now().toString().slice(-5)}`;
        
        const booking = new TableBooking({
            restaurant: formData.get("restaurant"),
            bookingCode,
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            date: new Date(formData.get("date")),
            timeSlot: formData.get("timeSlot"),
            guests: Number(formData.get("guests")),
            status: "EN_ATTENTE"
        });

        await booking.save();
        
        // Ici, envoyer un SMS ou Mail de confirmation si besoin

        return { success: true, code: bookingCode };

    } catch (error) {
        console.error("Booking Error:", error);
        return { success: false, error: "Impossible de réserver la table." };
    }
}