import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  restaurant: { type: String, required: true }, // "hebron" ou "teresa"
  
  // Infos Client
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  message: { type: String }, // Note client
  
  // Infos Table
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  guests: { type: Number, required: true },
  
  // Infos Pré-commande
  items: [{
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number } // 🎯 UNIFIÉ : correspond maintenant au panier du frontend
  }],
  
  // 💰 MONTANT TOTAL : On s'assure qu'il est bien enregistré comme un nombre
  totalAmount: { type: Number, required: true, default: 0 }, 
  
  // Preuve de paiement
  paymentProofUrl: { type: String, required: true },
  
  status: {
    type: String,
    enum: ["EN_ATTENTE", "CONFIRMEE", "TERMINEE", "ANNULEE"],
    default: "EN_ATTENTE"
  }
}, { 
  timestamps: true // ⏱️ CRUCIAL : Génère createdAt et updatedAt automatiquement
});

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);