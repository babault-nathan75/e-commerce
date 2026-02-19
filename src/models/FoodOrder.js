import mongoose from "mongoose";

const foodOrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  restaurant: { type: String, required: true }, // "hebron" ou "teresa"
  
  // Infos Client
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  
  // Détails de la commande
  items: [{
    name: String,
    price: Number,
    qty: Number
  }],
  totalAmount: { type: Number, required: true },
  
  // Preuve de paiement
  paymentProofUrl: { type: String, required: true },
  
  // Statut
  status: {
    type: String,
    enum: ["EN_ATTENTE_DE_VALIDATION", "PREPARATION", "EN_LIVRAISON", "LIVREE", "ANNULEE"],
    default: "EN_ATTENTE_DE_VALIDATION"
  }
}, { timestamps: true });

export const FoodOrder = mongoose.models.FoodOrder || mongoose.model("FoodOrder", foodOrderSchema);