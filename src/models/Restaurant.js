import mongoose from "mongoose";

// Schéma pour les Plats (Menu)
const MenuItemSchema = new mongoose.Schema({
  restaurant: { type: String, required: true }, // "hebron" ou "teresa"
  category: { type: String, required: true },   // "Entrées", "Grillades", etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true }
});

// Schéma pour les Réservations de Table
const TableBookingSchema = new mongoose.Schema({
  restaurant: { type: String, required: true }, // "hebron" ou "teresa"
  bookingCode: { type: String, unique: true },
  
  // Client
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  
  // Détails
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // "12h-14h", "19h-21h"
  guests: { type: Number, required: true },
  
  status: { type: String, default: "EN_ATTENTE" }, // EN_ATTENTE, CONFIRME, REFUSE
  createdAt: { type: Date, default: Date.now }
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
export const TableBooking = mongoose.models.TableBooking || mongoose.model("TableBooking", TableBookingSchema);