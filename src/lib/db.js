import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// --- VÉRIFICATION DE LA CONFIGURATION SYSTÈME ---
if (!MONGODB_URI) {
  console.error("❌ [DB CRITICAL] : MONGODB_URI absent des variables d'environnement.");
  throw new Error("Échec du protocole : Configurez le lien MongoDB dans votre terminal .env");
}

/**
 * PROTOCOLE : Singleton de Connexion Hebron
 * Empêche la multiplication des sockets en mode développement.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // 1. VÉRIFICATION DE LA LIAISON EXISTANTE
  if (cached.conn) {
    return cached.conn;
  }

  // 2. INITIALISATION DU TUNNEL DE DONNÉES
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Désactive la mise en file d'attente pour un retour d'erreur immédiat
      maxPoolSize: 10,       // Limite le nombre de connexions simultanées pour optimiser les ressources
      serverSelectionTimeoutMS: 5000, // Délai d'attente avant abandon (5 secondes)
      socketTimeoutMS: 45000, // Délai de maintien de la socket active
    };

    console.log("📡 [DB PROTOCOL] : Tentative d'établissement du lien avec MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ [DB PROTOCOL] : Lien établi. Accès aux bases Hebron autorisé.");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Réinitialisation en cas d'échec pour permettre une nouvelle tentative
    console.error("❌ [DB CRITICAL] : Échec de la connexion au nœud de données.", error.message);
    throw error;
  }

  return cached.conn;
}