import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // Ex: HEB-8472
    restaurant: { type: String, required: true }, // "hebron" ou "teresa"
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guests: { type: Number, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["en_attente", "confirmee", "annulee"], 
      default: "en_attente" 
    },
  },
  { timestamps: true }
);

export const Reservation = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);