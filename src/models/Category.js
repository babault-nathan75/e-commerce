import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  channel: { type: String, enum: ['shop', 'library'], required: true },
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);