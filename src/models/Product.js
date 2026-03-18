import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    
    // ✅ Ce champ recevra l'URL complète renvoyée par Cloudinary
    // (ex: https://res.cloudinary.com/votre_cloud/image/upload/v123/produit.jpg)
    imageUrl: { 
      type: String, 
      required: true,
      trim: true 
    },

    description: { type: String, required: true },

    channel: {
      type: String,
      enum: ["shop", "library"],
      required: true
    },

    productType: {
      type: String,
      enum: ["physical", "digital"],
      default: "physical"
    },

    category: [{ type: String }],

    // ✅ STOCK TOUJOURS PRÉSENT
    stockAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);