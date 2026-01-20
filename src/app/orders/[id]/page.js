import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import CancelOrderBox from "./ui/CancelOrderBox";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Calendar, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Clock,
  AlertTriangle
} from "lucide-react";

// Helper pour le style des statuts (Cohérent avec la liste des commandes)
const getStatusConfig = (status) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("livré") || s.includes("terminé")) {
    return { 
      color: "text-green-600 dark:text-green-400", 
      bg: "bg-green-100 dark:bg-green-900/30", 
      border: "border-green-200 dark:border-green-800",
      icon: CheckCircle2,
      label: "Commande Livrée"
    };
  }
  if (s.includes("annulé") || s.includes("échoué")) {
    return { 
      color: "text-red-600 dark:text-red-400", 
      bg: "bg-red-100 dark:bg-red-900/30", 
      border: "border-red-200 dark:border-red-800",
      icon: XCircle,
      label: "Commande Annulée"
    };
  }
  if (s.includes("expédition") || s.includes("route")) {
    return { 
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      border: "border-blue-200 dark:border-blue-800",
      icon: Truck,
      label: "En cours d'expédition"
    };
  }
  return { 
    color: "text-yellow-600 dark:text-yellow-400", 
    bg: "bg-yellow-100 dark:bg-yellow-900/30", 
    border: "border-yellow-200 dark:border-yellow-800",
    icon: Clock,
    label: "En traitement"
  };
};

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  
  // --- ÉTATS D'ERREUR/ACCÈS (Design simple et propre) ---
  const ErrorState = ({ message }) => (
    <DashboardLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-gray-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</h2>
        <Link href="/orders" className="text-orange-500 hover:underline font-medium">
          Retour à mes commandes
        </Link>
      </div>
    </DashboardLayout>
  );

  if (!session?.user) return <ErrorState message="Connexion requise pour voir cette commande." />;

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order) return <ErrorState message="Cette commande est introuvable." />;

  const isOwner = order.userId?.toString() === session.user.id;
  const isAdmin = !!session.user.isAdmin;

  if (!isAdmin && !isOwner) return <ErrorState message="Vous n'avez pas l'autorisation de voir cette commande." />;

  const canCancel = !order.canceledAt && order.status !== "LIVRER";
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
        
        {/* --- HEADER --- */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/orders" 
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Commande <span className="font-mono text-gray-500 dark:text-gray-400">#{order.orderCode}</span>
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute:'2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold shadow-sm w-fit
                ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}
              `}>
                <StatusIcon size={16} />
                {order.status}
              </div>

            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* === COLONNE GAUCHE (ARTICLES & LIVRAISON) === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. LISTE DES ARTICLES */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={18} className="text-orange-500" />
                  Articles commandés
                </h2>
                <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded text-gray-500">
                  {order.totalItems} items
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((it, idx) => (
                  <div key={idx} className="p-5 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    
                    {/* Image */}
                    <div className="w-20 h-20 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20}/></div>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-2">
                        {it.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Qté: <span className="font-bold text-gray-900 dark:text-white">{it.quantity}</span> × {it.price.toLocaleString()} FCFA
                      </p>
                    </div>

                    {/* Total Ligne */}
                    <div className="text-right flex flex-col justify-center">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {(it.quantity * it.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. INFORMATION LIVRAISON (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adresse */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <MapPin size={14} /> Adresse de livraison
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {order.deliveryAddress || "Adresse non spécifiée"}
                </p>
              </div>

              {/* Contact */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-gray-400 uppercase text-xs font-bold tracking-wider">
                  <Phone size={14} /> Contact
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                  {order.contactPhone || "Non spécifié"}
                </p>
              </div>
            </div>
            
            {/* 3. INFO ANNULATION (Si annulée) */}
            {order.canceledAt && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/50">
                <h3 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} /> Commande annulée
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Le {new Date(order.canceledAt).toLocaleString()}
                </p>
                {order.cancelReason && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-300 italic">
                    " {order.cancelReason} "
                  </p>
                )}
              </div>
            )}

          </div>

          {/* === COLONNE DROITE (RÉSUMÉ FINANCIER & ACTIONS) === */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-none p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-orange-500" />
                Résumé
              </h3>

              <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>{order.totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6">
                <span className="font-bold text-gray-900 dark:text-white text-lg">Total Payé</span>
                <div className="text-right">
                   <span className="block font-black text-2xl text-orange-500">
                     {order.totalPrice.toLocaleString()}
                   </span>
                   <span className="text-xs text-gray-400 font-bold">FCFA</span>
                </div>
              </div>

              {/* ACTION D'ANNULATION */}
              {canCancel ? (
                <div className="mt-2">
                   <CancelOrderBox
                    orderId={order._id.toString()}
                    canCancel={canCancel}
                  />
                </div>
              ) : !order.canceledAt ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Cette commande ne peut plus être annulée car elle est déjà en cours de livraison ou livrée.
                </div>
              ) : null}

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                 <p className="text-xs text-center text-gray-400">
                   Besoin d'aide ? <Link href="/contact" className="text-orange-500 hover:underline">Contactez le support</Link>
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}