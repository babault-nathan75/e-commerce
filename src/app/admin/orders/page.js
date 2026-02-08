import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { 
  Package, 
  User, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  ShoppingBag,
  CreditCard,
  Truck,
  UserCircle2,
  Search,
  X,
  Store, // <--- AJOUT POUR ICONE RETRAIT
  CheckCircle2
} from "lucide-react";

// Fonction utilitaire pour déterminer le style et le label selon le contexte complet
const getStatusConfig = (order) => {
    const isPickup = order.deliveryMethod === "RETRAIT";

    // 1. CAS ANNULATION (Priorité absolue)
    if (order.canceledAt || order.status === "ANNULER") {
        return { 
            label: "Annulée", 
            classes: "bg-rose-50 text-rose-600 border-rose-100", 
            barColor: "bg-rose-500",
            icon: <CreditCard size={12} /> 
        };
    }

    // 2. CAS TERMINÉ
    if (order.status === "LIVRER") {
        if (isPickup) {
            return { 
                label: "Retrait Terminé", 
                classes: "bg-teal-50 text-teal-600 border-teal-100", // Turquoise pour retrait fini
                barColor: "bg-teal-500",
                icon: <CheckCircle2 size={12} /> 
            };
        }
        return { 
            label: "Livraison Terminée", 
            classes: "bg-emerald-50 text-emerald-600 border-emerald-100", // Vert pour livraison finie
            barColor: "bg-emerald-500",
            icon: <Package size={12} /> 
        };
    }

    // 3. CAS EN COURS DE LIVRAISON
    if (order.status === "EN_COURS_DE_LIVRAISON") {
        return { 
            label: "En livraison", 
            classes: "bg-amber-50 text-amber-600 border-amber-100", // Orange
            barColor: "bg-amber-500",
            icon: <Truck size={12} /> 
        };
    }

    // 4. CAS RETRAIT EN BOUTIQUE (En attente ou Prêt)
    if (isPickup) {
        if (order.status === "PRET_POUR_RETRAIT") {
            return { 
                label: "Prêt en Boutique", 
                classes: "bg-purple-100 text-purple-700 border-purple-200", // Violet foncé
                barColor: "bg-purple-600",
                icon: <Store size={12} /> 
            };
        }
        // Statut EFFECTUER ou EN_ATTENTE pour retrait
        return { 
            label: "Nouveau Retrait", 
            classes: "bg-purple-50 text-purple-600 border-purple-100", // Violet clair
            barColor: "bg-purple-500",
            icon: <Store size={12} /> 
        };
    }

    // 5. CAS PAR DÉFAUT (Nouvelle Livraison)
    return { 
        label: "Nouvelle Livraison", 
        classes: "bg-blue-50 text-blue-600 border-blue-100", // Bleu
        barColor: "bg-blue-500",
        icon: <ShoppingBag size={12} /> 
    };
};

export default async function AdminOrdersPage({ searchParams }) {
  await connectDB();
  
  // ✅ 1. RÉCUPÉRATION DES FILTRES
  const params = await searchParams;
  const query = params.q || "";

  // ✅ 2. REQUÊTE
  let filter = {};
  if (query) {
    filter = {
      $or: [
        { orderCode: { $regex: query, $options: "i" } },
        { "guest.name": { $regex: query, $options: "i" } },
        { userEmail: { $regex: query, $options: "i" } }
      ]
    };
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* --- HEADER FIXE --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="group flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-orange-500 transition-all">
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-orange-50 transition-colors">
              <ArrowLeft size={16} />
            </div>
            RETOUR
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        
        {/* --- TITRE ET STATS --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
              Listes des <span className="text-orange-500">commandes</span>
            </h1>
            <p className="text-gray-400 font-bold text-sm mt-2 flex items-center gap-2 uppercase tracking-wide">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {query ? `Résultats pour "${query}"` : `${orders.length} Flux détectés`}
            </p>
          </div>

          {/* BARRE DE RECHERCHE */}
          <form method="GET" action="/admin/orders" className="relative group w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher par ID ou Nom..."
              className="w-full pl-14 pr-12 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 font-bold text-sm shadow-sm transition-all"
            />
            {query && (
              <Link href="/admin/orders" className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-rose-500">
                <X size={18} />
              </Link>
            )}
          </form>
        </div>

        {/* --- LISTE DES COMMANDES --- */}
        <div className="grid gap-6">
          {orders.map((o) => {
            const isGuest = !!o.guest?.email;
            
            // 🔥 Calcul dynamique de la configuration visuelle
            const visualConfig = getStatusConfig(o);

            return (
              <Link
                key={o._id.toString()}
                href={`/admin/orders/${o._id}`}
                className="group bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-orange-200 transition-all duration-500 relative overflow-hidden"
              >
                {/* Barre de couleur dynamique sur la gauche */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${visualConfig.barColor} transition-all`} />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-5">
                    {/* Icône dynamique avec couleurs */}
                    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${visualConfig.classes}`}>
                       {visualConfig.icon}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-xl text-gray-900 tracking-tighter uppercase font-mono">
                          #{o.orderCode}
                        </span>
                        {/* Label dynamique */}
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${visualConfig.classes}`}>
                          {visualConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <Clock size={14} className="text-gray-300" />
                          {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          {isGuest ? <User size={14} className="text-orange-500" /> : <UserCircle2 size={14} className="text-blue-500" />}
                          {isGuest ? o.guest?.name : o.userEmail || "Membre Premium"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-6 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Prix de la commande</p>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">
                          {o.totalPrice?.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">FCFA</span>
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-orange-500 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* EMPTY STATE */}
          {orders.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                 {query ? <Search size={40} /> : <ShoppingBag size={40} />}
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase italic">
                {query ? "Aucun résultat trouvé" : "Aucun flux détecté"}
              </h3>
              <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">
                {query 
                  ? `Aucune commande ne correspond à "${query}". Vérifiez l'orthographe ou l'ID.`
                  : "Les commandes apparaîtront ici dès qu'une vente sera validée."}
              </p>
              {query && (
                <Link href="/admin/orders" className="mt-8 text-xs font-black text-orange-500 border-b-2 border-orange-500 pb-1 uppercase tracking-widest">
                  Réinitialiser la recherche
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}