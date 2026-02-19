import { connectDB } from "@/lib/db";
import { FoodOrder } from "@/models/FoodOrder";
import { updateFoodOrderStatus } from "@/lib/actions/foodOrder";
import { CheckCircle, Truck, XCircle, Clock, AlertTriangle, ExternalLink, User, MapPin, Phone, Eye, ArrowLeft, Search, X } from "lucide-react";
import Link from "next/link";

// Force la page à se rafraîchir à chaque visite
export const dynamic = "force-dynamic";

export default async function AdminGastronomiePage({ searchParams }) {
  await connectDB();
  
  // 1. Gestion des paramètres d'URL
  const params = await searchParams;
  const selectedId = params?.id;
  const query = params?.search || ""; // 🔍 Récupération du terme de recherche

  // 2. Logique de filtrage MongoDB (Côté Serveur)
  let dbFilter = {};
  if (query) {
    dbFilter = {
      $or: [
        { orderCode: { $regex: query, $options: "i" } },     // Recherche par Réf
        { customerName: { $regex: query, $options: "i" } },  // Recherche par Nom
        { customerPhone: { $regex: query, $options: "i" } }, // Recherche par Téléphone
      ],
    };
  }

  // Helper pour les badges de statut
  const getStatusStyle = (status) => {
    switch (status) {
      case "EN_ATTENTE_DE_VALIDATION": return "bg-orange-100 text-orange-700 border-orange-200";
      case "PREPARATION": return "bg-blue-100 text-blue-700 border-blue-200";
      case "EN_LIVRAISON": return "bg-purple-100 text-purple-700 border-purple-200";
      case "LIVREE": return "bg-green-100 text-green-700 border-green-200";
      case "ANNULEE": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  // =================================================================================
  // VUE DÉTAILLÉE (Si un ID est sélectionné)
  // =================================================================================
  if (selectedId) {
    const order = await FoodOrder.findById(selectedId).lean();

    if (!order) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-red-500">Commande introuvable</h2>
                <Link href="/admin/gastronomie" className="text-blue-600 underline mt-4 block">Retour à la liste</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <Link href="/admin/gastronomie" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors">
                    <ArrowLeft size={20} /> Retour à la liste
                </Link>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row">
                    {/* ZONE PREUVE DE PAIEMENT */}
                    <div className="w-full lg:w-96 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-8 flex flex-col items-center justify-center text-center relative group">
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status.replace(/_/g, " ")}
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 mt-8 lg:mt-0">Preuve reçue</p>
                        <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="relative block rounded-2xl overflow-hidden border-4 border-white shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform duration-300 w-full">
                            <img src={order.paymentProofUrl} alt="Preuve" className="w-full h-auto object-cover bg-slate-200 min-h-[200px]" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ExternalLink className="text-white w-8 h-8" />
                            </div>
                        </a>
                    </div>

                    {/* DÉTAILS COMMANDE */}
                    <div className="flex-1 p-8">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-1">{order.orderCode}</h2>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg border text-[10px] font-black uppercase tracking-wide ${order.restaurant === 'hebron' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                    <MapPin size={10} />
                                    {order.restaurant === 'hebron' ? 'Hebron de Assinie-mafia' : 'Espace Teresa'}
                                </div>
                                <p className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{(order.totalAmount || 0).toLocaleString()} <span className="text-lg text-slate-400 font-bold">FCFA</span></p>
                                <p className="text-sm text-slate-400 font-bold flex items-center gap-2"><Clock size={16} /> {new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12} /> Client</h3>
                                    <p className="font-bold text-slate-900">{order.customerName}</p>
                                    <p className="text-slate-500 text-xs">{order.customerPhone}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} /> Livraison</h3>
                                    <p className="text-slate-700 text-xs font-medium">{order.deliveryAddress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Articles commandés</h3>
                            <ul className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">
                                        <span><span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 mr-2">x{item.qty || item.quantity}</span> {item.name}</span>
                                        <span className="text-slate-900 font-black">{(item.price * (item.qty || item.quantity)).toLocaleString()} FCFA</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center gap-3">
                            {order.status === "EN_ATTENTE_DE_VALIDATION" && (
                                <form action={async () => { "use server"; await updateFoodOrderStatus(order._id.toString(), "PREPARATION"); }}>
                                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
                                        <CheckCircle size={20} /> VALIDER LE PAIEMENT
                                    </button>
                                </form>
                            )}
                            {order.status === "PREPARATION" && (
                                <form action={async () => { "use server"; await updateFoodOrderStatus(order._id.toString(), "EN_LIVRAISON"); }}>
                                    <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
                                        <Truck size={20} /> CONFIER AU LIVREUR
                                    </button>
                                </form>
                            )}
                            {order.status === "EN_LIVRAISON" && (
                                <form action={async () => { "use server"; await updateFoodOrderStatus(order._id.toString(), "LIVREE"); }}>
                                    <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-1">
                                        <CheckCircle size={20} /> MARQUER COMME LIVRÉE
                                    </button>
                                </form>
                            )}
                            {order.status !== "ANNULEE" && order.status !== "LIVREE" && (
                                <form action={async () => { "use server"; await updateFoodOrderStatus(order._id.toString(), "ANNULEE"); }} className="ml-auto">
                                    <button className="flex items-center gap-2 bg-white border-2 border-slate-200 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-colors">
                                        <XCircle size={20} /> ANNULER
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // =================================================================================
  // VUE LISTE (Filtrée par la recherche)
  // =================================================================================
  const orders = await FoodOrder.find(dbFilter).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                <ArrowLeft size={20} /> Retour au menu principal
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Commandes Gastronomie</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez les livraisons et repas.</p>
                </div>

                {/* 🔍 BARRE DE RECHERCHE SERVEUR (NON DYNAMIQUE) */}
                <form method="GET" action="/admin/gastronomie" className="flex w-full md:w-96 gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            name="search" 
                            defaultValue={query}
                            placeholder="Réf, Nom ou Téléphone..."
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700 shadow-sm"
                        />
                        {query && (
                            <Link href="/admin/gastronomie" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors">
                                <X size={18} />
                            </Link>
                        )}
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                        OK
                    </button>
                </form>

                <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {orders.length} Résultat(s)
                </div>
            </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-600">Aucune commande trouvée</h3>
            {query && <p className="text-slate-400 mt-2 font-medium">Aucun résultat pour "{query}"</p>}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <th className="p-4">Réf</th>
                            <th className="p-4">Lieu</th> 
                            <th className="p-4">Client</th>
                            <th className="p-4 text-right">Montant</th>
                            <th className="p-4 text-center">Statut</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => (
                            <tr key={order._id.toString()} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4 font-black text-slate-900">{order.orderCode}</td>
                                <td className="p-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wide ${order.restaurant === 'hebron' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                        <MapPin size={10} />
                                        {order.restaurant === 'hebron' ? 'Hebron' : 'Teresa'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-700 text-sm">{order.customerName}</div>
                                    <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                                </td>
                                <td className="p-4 text-right font-black text-slate-900 text-sm">{(order.totalAmount || 0).toLocaleString()} FCFA</td>
                                <td className="p-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                                        {order.status === 'EN_ATTENTE_DE_VALIDATION' ? 'EN ATTENTE' : order.status.replace(/_/g, " ")}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/gastronomie?id=${order._id}`} className="inline-flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                                        <Eye size={14} /> Voir
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}