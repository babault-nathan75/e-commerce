import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true }, // ex: /uploads/xxx.jpg
    description: { type: String, required: true },

    channel: { type: String, enum: ["shop", "library"], required: true },
    productType: { type: String, enum: ["physical", "digital"], default: "physical" },
    category: [{ type: String }]
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);