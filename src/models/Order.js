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

    status: {
      type: String,
      enum: [
        "EFFECTUER",
        "EN_COURS_DE_LIVRAISON",
        "LIVRER",
        "ANNULEE"
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