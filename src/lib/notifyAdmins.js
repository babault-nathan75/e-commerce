import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

/**
 * PROTOCOLE : Diffusion d'Alerte aux Nœuds d'Administration
 * Statut : Transmission Interne Prioritaire
 */
export async function notifyAdmins({ title, message, link }) {
  const timestamp = new Date().toISOString();
  console.log(`[NOTIFICATION OPS] : Initialisation de la diffusion - ${title}`);

  try {
    // 1. IDENTIFICATION DES UNITÉS D'ADMINISTRATION
    // .lean() est crucial ici : il retourne des objets JS purs au lieu de documents Mongoose lourds
    const admins = await User.find({ isAdmin: true })
      .select("_id")
      .lean();

    if (!admins.length) {
      console.warn(`[NOTIFICATION WARNING] : Aucun nœud d'administration détecté. Annulation.`);
      return { success: false, reason: "NO_ADMINS_FOUND" };
    }

    // 2. GÉNÉRATION DES PAQUETS DE DONNÉES
    const notificationPayloads = admins.map((admin) => ({
      userId: admin._id,
      title: title.toUpperCase(), // Style Terminal
      message,
      link,
      isRead: false,
      createdAt: timestamp
    }));

    // 3. INJECTION MASSIVE (ATOMIC INSERT)
    // insertMany est beaucoup plus performant qu'une boucle .save()
    await Notification.insertMany(notificationPayloads);

    console.log(`[NOTIFICATION OPS] : Diffusion réussie vers ${admins.length} unités.`);
    
    return { 
      success: true, 
      broadcastCount: admins.length,
      protocol: "HEBRON_INTERNAL_ALERT" 
    };

  } catch (error) {
    console.error(`[CRITICAL ERROR] : Échec du protocole de diffusion.`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}