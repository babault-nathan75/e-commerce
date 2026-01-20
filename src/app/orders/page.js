import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ShoppingBag,
  CalendarDays,
  Truck
} from "lucide-react";

// Helper pour le style des statuts
const getStatusStyle = (status) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("livré") || s.includes("terminé")) {
    return { 
      bg: "bg-green-100 dark:bg-green-900/30", 
      text: "text-green-700 dark:text-green-400", 
      icon: CheckCircle2 
    };
  }
  if (s.includes("annulé") || s.includes("échoué")) {
    return { 
      bg: "bg-red-100 dark:bg-red-900/30", 
      text: "text-red-700 dark:text-red-400", 
      icon: XCircle 
    };
  }
  if (s.includes("expédition") || s.includes("route")) {
    return { 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      text: "text-blue-700 dark:text-blue-400", 
      icon: Truck 
    };
  }
  // Défaut (En attente / Traitement)
  return { 
    bg: "bg-yellow-100 dark:bg-yellow-900/30", 
    text: "text-yellow-700 dark:text-yellow-400", 
    icon: Clock 
  };
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  // --- ÉTAT NON CONNECTÉ (Design Card) ---
  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connectez-vous</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Vous devez être identifié pour accéder à votre historique de commandes.
            </p>
            <Link
              href="/login"
              className="block w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-transform hover:scale-[1.02]"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  await connectDB();
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Mes Commandes
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Suivez et gérez vos achats récents.
              </p>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* --- LISTE DES COMMANDES --- */}
          {orders.length === 0 ? (
            // EMPTY STATE
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                <Package size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune commande pour le moment</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Dès que vous passerez commande, elle apparaîtra ici avec tous les détails de suivi.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                Explorer la boutique <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            // ORDER GRID
            <div className="grid gap-4">
              {orders.map((o) => {
                const style = getStatusStyle(o.status);
                const StatusIcon = style.icon;

                return (
                  <Link
                    key={o._id.toString()}
                    href={`/orders/${o._id}`}
                    className="
                      group relative overflow-hidden
                      bg-white dark:bg-gray-900 
                      border border-gray-200 dark:border-gray-800
                      rounded-2xl p-5 md:p-6
                      shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50
                      hover:border-orange-200 dark:hover:border-orange-900/50
                      transition-all duration-300
                    "
                  >
                    {/* Décoration Hover (Bande latérale) */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* GAUCHE : ID & DATE */}
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                          <Package size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                              {o.orderCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <CalendarDays size={14} />
                            {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric"
                            })}
                          </div>
                        </div>
                      </div>

                      {/* DROITE : STATUS & PRIX */}
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-4 md:pt-0">
                        
                        {/* Badge Statut */}
                        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                          <StatusIcon size={14} />
                          {o.status}
                        </div>

                        {/* Prix & Items */}
                        <div className="text-right">
                          <div className="text-lg font-black text-gray-900 dark:text-white">
                            {o.totalPrice.toLocaleString()} FCFA
                          </div>
                          <div className="text-xs font-medium text-gray-400">
                            {o.totalItems} article{o.totalItems > 1 ? "s" : ""}
                          </div>
                        </div>

                        {/* Chevron (Visible Desktop) */}
                        <div className="hidden md:block text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
                          <ChevronRight size={24} />
                        </div>

                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}