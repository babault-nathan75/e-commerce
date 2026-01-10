import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Package, User, Clock, ChevronRight, ArrowLeft, LayoutDashboard } from "lucide-react";

const statusStyles = {
  EFFECTUER: "bg-blue-100 text-blue-700",
  EN_COURS_DE_LIVRAISON: "bg-orange-100 text-orange-700",
  LIVRER: "bg-green-100 text-green-700",
  ANNULER: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* BARRE DE NAVIGATION SUPÉRIEURE */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-green transition-all group"
        >
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-brand-green/10">
            <ArrowLeft className="w-4 h-4" />
          </div>
          RETOUR AU DASHBOARD
        </Link>
        
        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
          <LayoutDashboard className="w-3 h-3" />
          Admin Panel
        </div>
      </div>

      {/* HEADER DE LA PAGE */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">
            Gestion des <span className="text-brand-green">Commandes</span>
          </h1>
          <p className="text-gray-500 text-sm italic">
            Visualisez et gérez le flux de vos ventes en temps réel.
          </p>
        </div>
        <div className="hidden md:block bg-brand-green/10 p-4 rounded-2xl">
            <Package className="w-10 h-10 text-brand-green" />
        </div>
      </div>

      {/* LISTE DES COMMANDES */}
      <div className="grid gap-4">
        {orders.map((o) => {
          const isGuest = !!o.guest?.email;
          const statusClass = o.canceledAt ? statusStyles.ANNULER : statusStyles[o.status];

          return (
            <Link
              key={o._id.toString()}
              href={`/admin/orders/${o._id}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${o.canceledAt ? 'bg-red-500' : 'bg-brand-green opacity-0 group-hover:opacity-100 transition-opacity'}`} />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg text-gray-800 tracking-tighter uppercase">
                      {o.orderCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusClass}`}>
                      {o.canceledAt ? "ANNULÉE" : o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <User className="w-3.5 h-3.5" />
                      {isGuest ? o.guest?.name : "Utilisateur Inscrit"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant Total</p>
                    <p className="text-xl font-black text-brand-green">
                      {o.totalPrice?.toLocaleString()} <span className="text-xs">FCFA</span>
                    </p>
                    <p className="text-xs text-gray-400">{o.totalItems || 0} article(s)</p>
                  </div>
                  
                  <div className="bg-gray-50 group-hover:bg-brand-green group-hover:text-white p-2 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

              </div>
            </Link>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune commande pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}