"use server";

import { connectDB } from "@/lib/db";
import { StockLog } from "@/models/StockLog";

/**
 * PROTOCOLE : Extraction de Données Inventaire (CSV)
 */
export async function getInventoryCSVData() {
  try {
    await connectDB();
    
    const logs = await StockLog.find()
      .populate("productId", "name")
      .sort({ timestamp: -1 })
      .lean();

    // Définition des en-têtes du fichier
    const headers = ["Date", "Heure", "Produit", "Action", "Variation", "Stock Final"];
    
    // Transformation des données en lignes CSV
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleDateString('fr-FR'),
      new Date(log.timestamp).toLocaleTimeString('fr-FR'),
      log.productId?.name || "N/A",
      log.reason,
      log.change,
      log.newStock
    ]);

    // Construction de la chaîne CSV
    const csvContent = [headers, ...rows]
      .map(row => row.join(";")) // Utilisation du point-virgule pour Excel FR
      .join("\n");

    return { success: true, data: csvContent };
  } catch (error) {
    console.error("[EXPORT ERROR] :", error);
    return { success: false, error: error.message };
  }
}