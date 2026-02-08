"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Truck,
  XCircle,
  ChevronRight,
  Loader2,
  Box
} from "lucide-react";

// Helper pour les couleurs de statut
const getStatusStyle = (status) => {
  const s = status?.toUpperCase() || "";
  if (s.includes("LIVRER") || s.includes("TERMINÉ")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
  if (s.includes("ANNULÉ") || s.includes("ECHEC")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  if (s.includes("EXPEDITION") || s.includes("ROUTE")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
};

export default function OrderTrackPage() {
  const sp = useSearchParams();

  const [orderCode, setOrderCode] = useState(sp.get("code") || "");
  const [email, setEmail] = useState(sp.get("email") || "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const canCancel = useMemo(() => {
    if (!order) return false;
    if (order.status === "LIVRER") return false;
    if (order.canceledAt) return false;
    return true;
  }, [order]);

  async function loadOrder(e) {
    if (e) e.preventDefault();
    setErr("");
    setOrder(null);
    setCancelMsg("");

    if (!orderCode.trim() || !email.trim()) {
      setErr("Le code de commande et l’email sont requis.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderCode=${encodeURIComponent(
          orderCode.trim()
        )}&email=${encodeURIComponent(email.trim().toLowerCase())}`,
        { cache: "no-store" }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Commande introuvable");

      setOrder(data.order);
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function cancelGuestOrder() {
    setErr("");
    setCancelMsg("");

    if (cancelReason.trim().length < 5) {
      setErr("Le motif d'annulation est trop court (min 5 caractères).");
      return;
    }

    setCancelLoading(true);
    try {
      const res = await fetch("/api/orders/guest/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: orderCode.trim(),
          email: email.trim().toLowerCase(),
          cancelReason: cancelReason.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Annulation échouée");

      setCancelMsg("Votre commande a été annulée avec succès.");
      await loadOrder();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setCancelLoading(false);
    }
  }

  useEffect(() => {
    if (sp.get("code") && sp.get("email")) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 py-10 px-4 md:px-6">
        
        {/* --- DÉCORATION D'ARRIÈRE-PLAN --- */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-orange-500/5 to-transparent dark:from-orange-900/10 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          
          {/* ===== HEADER ===== */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
               <Truck size={32} className="text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Suivi de Commande
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Entrez vos informations ci-dessous pour suivre l'état de votre commande en temps réel.
            </p>
          </div>

          {/* ===== RECHERCHE FORM ===== */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-800 mb-8 relative z-10">
            <form onSubmit={loadOrder} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                    Numéro de commande
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none font-mono text-gray-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-gray-400 uppercase"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                      placeholder="CMD-123456-789"
                    />
                  </div>
                </div>

                {/* Input Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                    Email de commande
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-gray-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
              </div>

              {err && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{err}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                 <p className="text-xs text-gray-400 max-w-xs">
                   * Ce service est destiné aux commandes passées en tant qu'invité. Les membres peuvent voir leurs commandes dans leur profil.
                 </p>
                 <button
                  disabled={loading}
                  type="submit"
                  className="
                    w-full md:w-auto px-8 py-3.5 rounded-xl
                    bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                    font-black uppercase tracking-widest
                    hover:bg-orange-600 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900
                    transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                  {loading ? "Recherche..." : "Rechercher"}
                </button>
              </div>
            </form>
          </div>

          {/* ===== RÉSULTATS (TICKET DE COMMANDE) ===== */}
          {order && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Entête du Ticket */}
              <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 md:p-8 border-x border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"></div>
                 
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono text-gray-400">#</span>{order.orderCode}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar size={14}/> 
                      Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                 </div>

                 <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                    <Box size={16} /> {order.status}
                 </div>
              </div>

              {/* Corps du Ticket (Grid Info) */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border-x border-gray-200 dark:border-gray-800 p-6 md:p-8 grid md:grid-cols-2 gap-8">
                
                {/* Client Info */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Information Client</h3>
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-400 border border-gray-100 dark:border-gray-700"><User size={16}/></div>
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white text-sm">{order.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Client Invité</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-400 border border-gray-100 dark:border-gray-700"><Mail size={16}/></div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm py-1.5">{order.email}</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-400 border border-gray-100 dark:border-gray-700"><Phone size={16}/></div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm py-1.5">{order.contact}</p>
                   </div>
                </div>

                {/* Livraison Info */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Livraison</h3>
                   <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <MapPin className="text-orange-500 shrink-0 mt-0.5" size={18}/>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {order.deliveryAddress}
                      </p>
                   </div>
                </div>

              </div>

              {/* Liste Articles */}
              <div className="bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 p-6 md:p-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Détails de la commande</h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                            x{it.quantity}
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{it.name}</p>
                            <p className="text-xs text-gray-400">{it.price.toLocaleString()} FCFA / unité</p>
                         </div>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                         {(it.quantity * it.price).toLocaleString()} FCFA
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux & Footer Ticket */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl border-x border-b border-gray-200 dark:border-gray-800 p-6 md:p-8">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-gray-500">Total payé</span>
                    <span className="text-2xl font-black text-orange-500">{order.totalPrice.toLocaleString()} <span className="text-xs text-gray-400 font-bold">FCFA</span></span>
                 </div>

                 {/* Section Annulation */}
                 {order.status !== "LIVRER" && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                       <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-500"/> Zone d'annulation
                       </h4>
                       
                       {!canCancel ? (
                          <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                             Cette commande ne peut plus être annulée (Livrée ou déjà annulée).
                          </div>
                       ) : (
                          <div className="space-y-3">
                             <textarea
                                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-red-500 transition-colors resize-none"
                                placeholder="Motif de l'annulation (obligatoire)"
                                rows={2}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                             />
                             {cancelMsg && <p className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> {cancelMsg}</p>}
                             <button
                                disabled={cancelLoading}
                                onClick={cancelGuestOrder}
                                className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                             >
                                {cancelLoading ? "Traitement..." : "Annuler définitivement"}
                             </button>
                          </div>
                       )}
                    </div>
                 )}
              </div>

            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
               <ChevronRight size={14} className="rotate-180"/> Retour à l'accueil
            </Link>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}