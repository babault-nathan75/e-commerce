import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    default: "Plats de résistance" 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  restaurant: { 
    type: String, 
    enum: ['hebron', 'teresa'], 
    required: true 
  },
  imageUrl: { 
    type: String, 
    // L'URL de l'image sauvegardée localement (ex: /uploads/menu/plat_123.jpg)
  },
  isAvailable: { 
    type: Boolean, 
    default: true // Un nouveau plat est considéré comme disponible par défaut
  },
}, { 
  timestamps: true // Ajoute automatiquement 'createdAt' et 'updatedAt'
});

// Pour Next.js : on évite de recompiler le modèle à chaque rechargement à chaud
export const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);