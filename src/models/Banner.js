import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  link: { type: String, default: "/shop" }, // Où l'utilisateur est redirigé
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);