import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },   // snapshot
        price: { type: Number, required: true },  // snapshot
        quantity: { type: Number, required: true, min: 1 }
      }
    ],

    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    guest: {
      name: String,
      email: String,
      phone: String,
      deliveryAddress: String
    },

    deliveryAddress: { type: String, default: "" },
    contactPhone: { type: String, default: "" },

    // --- NOUVEAUX CHAMPS POUR GÉRER LE RETRAIT ET LE PAIEMENT ---
    deliveryMethod: {
      type: String,
      enum: ["LIVRAISON", "RETRAIT"], // Le client choisit ici
      default: "LIVRAISON",
      required: true
    },

    paymentProofUrl: { 
      type: String, 
      default: null // L'URL de la capture d'écran uploadée par le client
    },

    paymentStatus: {
      type: String,
      enum: ["EN_ATTENTE", "VALIDE", "REJETE", "NON_REQUIS"], 
      // EN_ATTENTE : Le client a uploadé la preuve, l'admin doit vérifier
      // VALIDE : L'admin a confirmé que l'argent est reçu
      // NON_REQUIS : Pour le paiement à la livraison classique
      default: "NON_REQUIS"
    },
    // ------------------------------------------------------------

    status: {
      type: String,
      enum: [
        "EFFECTUER",
        "EN_COURS_DE_LIVRAISON",
        "LIVRER",
        "ANNULER",
        "PRET_POUR_RETRAIT" // Optionnel : Utile si vous voulez signaler que le colis est prêt en boutique
      ],
      default: "EFFECTUER",
      index: true
    },

    cancelReason: { type: String, default: null },
    canceledAt: { type: Date, default: null },
    canceledBy: { type: String, enum: ["USER", "ADMIN", null], default: null }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);