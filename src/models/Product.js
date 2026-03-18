import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
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
    stockAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

// ✅ Cette syntaxe est plus robuste pour Turbopack et Next.js 16
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export { Product }; // Export nommé propre
export default Product; // Export par défaut par sécurité