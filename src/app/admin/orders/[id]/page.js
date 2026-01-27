import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import OrderStatusBox from "./ui/OrderStatusBox";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard, 
  AlertCircle,
  Clock,
  Printer,
  Copy,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default async function AdminOrderDetailsPage({ params }) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center flex flex-col items-center">
          <div className="p-6 bg-red-50 rounded-full mb-4">
             <AlertCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Commande Introuvable</h2>
          <Link href="/admin/orders" className="mt-4 text-orange-500 font-bold hover:underline">
            Retour à la liste des commandes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  let user = null;
  if (order.userId) {
    user = await User.findById(order.userId).select("name email phone").lean();
  }

  const isGuest = !!order.guest?.email;
  const displayName = isGuest ? order.guest?.name : (user?.name || order.name || "Utilisateur");
  const displayEmail = isGuest ? order.guest?.email : (user?.email || order.email || "");
  const displayPhone = isGuest ? order.guest?.phone : (user?.phone || order.contactPhone || "");
  const displayAddress = isGuest ? order.guest?.deliveryAddress : (order.deliveryAddress || "");

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f1f5f9] pb-20">
        
        {/* --- STICKY NAVIGATION BAR --- */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 transition-all">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/admin/orders" className="group flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors">
               <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                  <ArrowLeft size={16} />
               </div>
               LISTE DES COMMANDES
            </Link>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 mt-10">
          
          {/* --- TOP BANNER : IDENTITÉ DE COMMANDE --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                   Details de la commande
                </span>
                <span className="text-gray-300 font-light">/</span>
                <span className="font-mono text-[11px] text-gray-400 select-all">UUID: {order._id.toString()}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-4">
                #{order.orderCode}
                <button className="text-gray-300 hover:text-orange-500 transition-colors"><Copy size={20}/></button>
              </h1>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 bg-white px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100">
                   <Clock size={20} className="text-orange-500" />
                   <div className="flex flex-col">
                       <span className="text-[9px] text-gray-400 uppercase tracking-widest leading-none mb-1">Date d'enregistrement</span>
                       {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- SECTION PRINCIPALE (ARTICLES & CLIENT) --- */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* CARD CLIENT : DATAGRID STYLE */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <UserIcon size={120} />
                </div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Détails du Destinataire
                </h3>
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-8">
                    <InfoBlock icon={<UserIcon size={22}/>} label="Client" value={displayName} sub={isGuest ? "Commande Invité" : "Compte Client Hebron Ivoire Shops"} />
                    <InfoBlock icon={<Mail size={22}/>} label="Email" value={displayEmail || "---"} isEmail />
                  </div>
                  <div className="space-y-8">
                    <InfoBlock icon={<Phone size={22}/>} label="Téléphone" value={displayPhone} />
                    <InfoBlock icon={<MapPin size={22}/>} label="Adresse de livraison" value={displayAddress} isAddress />
                  </div>
                </div>
              </div>

              {/* CARD ARTICLES : TABLEAU ÉPURÉ */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Panier de Commande
                    </h3>
                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                        {order.totalItems} unité(s) au total
                    </div>
                </div>

                <div className="space-y-6">
                {order.items.map((it, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-6">
                      {/* CONTAINER IMAGE */}
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden p-2 group-hover:bg-white transition-colors shadow-inner border border-gray-100">
                        {it.imageUrl || it.image ? (
                          <img 
                            src={it.imageUrl || it.image} 
                            alt={it.name} 
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <Package className="text-gray-200" size={40} />
                        )}
                      </div>

                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">
                          {it.name}
                        </p>
                        <p className="text-[11px] font-black text-gray-400 mt-2 uppercase tracking-widest">
                          Quantité : <span className="text-gray-900">{it.quantity}</span> 
                          <span className="mx-3 opacity-20 text-gray-900">|</span> 
                          Prix Unitaire : <span className="text-gray-900">{it.price.toLocaleString()} FCFA</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900 tracking-tighter">
                        {(it.quantity * it.price).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">FCFA</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

                {/* TOTAL SUMMARY CARD */}
                <div className="mt-12 p-10 bg-[#232f3e] rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Total Transactionnel</p>
                        <p className="text-5xl font-black tracking-tighter">
                            {order.totalPrice.toLocaleString()} <span className="text-orange-500 text-xl font-bold tracking-widest">FCFA</span>
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col items-center md:items-end gap-3 text-center md:text-right">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20">
                            <ShieldCheck size={16} /> Paiement Sécurisé
                        </div>
                        <p className="text-[11px] font-medium text-white/50 max-w-[200px]">
                            Le montant inclut la livraison et les taxes applicables.
                        </p>
                    </div>
                    <CreditCard className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 -rotate-12 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* --- SIDEBAR : LOGISTIQUE & STATUTS --- */}
            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Processus Logistique</h3>
                <OrderStatusBox
                  orderId={order._id.toString()}
                  status={order.status}
                  canceledAt={order.canceledAt}
                />
              </div>

              {/* RAPPEL ANNULATION */}
              {order.canceledAt && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-8 animate-in zoom-in duration-500">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-6 font-black uppercase text-[10px] tracking-widest">
                    <AlertCircle size={20} /> Commande Annulée
                  </div>
                  <div className="space-y-6">
                    <AuditRow label="Date d'annulation" value={new Date(order.canceledAt).toLocaleString()} />
                    <AuditRow label="Motif fourni" value={order.cancelReason || "Non spécifié"} isItalic />
                    <AuditRow label="Opérateur" value={order.canceledBy || "Système"} />
                  </div>
                </div>
              )}

              {/* AUDIT RAPIDE */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-white/40 mb-6">Résumé de l'audit</h4>
                <div className="space-y-4">
                    <AuditRow label="Mode de paiement" value="À la livraison" light />
                    <AuditRow label="Type de Checkout" value={isGuest ? "Checkout Invité" : "Compte Client"} light />
                    <AuditRow label="Expédition" value="Standard (Abidjan)" light />
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

/* --- SOUS-COMPOSANTS DE STYLE --- */

function InfoBlock({ icon, label, value, sub, isEmail, isAddress }) {
    return (
        <div className="flex items-start gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all duration-300 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`font-black text-gray-900 leading-tight ${isEmail ? 'text-sm break-all' : 'text-lg'}`}>
                    {value}
                </p>
                {sub && <p className="text-[10px] font-bold text-orange-500 uppercase mt-1 tracking-tighter">{sub}</p>}
            </div>
        </div>
    );
}

function AuditRow({ label, value, isItalic, light }) {
    return (
        <div className={`py-3 flex flex-col border-b ${light ? 'border-white/10' : 'border-gray-100'}`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${light ? 'text-white/30' : 'text-gray-400'}`}>
                {label}
            </span>
            <span className={`text-sm font-bold ${light ? 'text-white' : 'text-gray-800'} ${isItalic ? 'italic font-medium' : ''}`}>
                {value}
            </span>
        </div>
    );
}