"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Truck, 
  PackageCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Package,
  ArrowLeft // Importé pour le bouton retour page
} from "lucide-react";

const nextStatusMap = {
  EFFECTUER: { next: "EN_COURS_DE_LIVRAISON", label: "Lancer la livraison", icon: Truck, color: "bg-blue-600" },
  EN_COURS_DE_LIVRAISON: { next: "LIVRER", label: "Confirmer la réception", icon: PackageCheck, color: "bg-green-600" },
  LIVRER: { next: null, label: "Commande terminée", icon: CheckCircle, color: "bg-gray-400" }
};

export default function OrderStatusBox({ orderId, status, canceledAt }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const currentStep = useMemo(() => nextStatusMap[status] || {}, [status]);
  const nextStatus = currentStep.next;
  const disabled = !!canceledAt || !nextStatus;

  async function goNext() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Mise à jour échouée");

      setMsg(`Statut mis à jour !`);
      router.refresh();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const steps = ["EFFECTUER", "EN_COURS_DE_LIVRAISON", "LIVRER"];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* HEADER AVEC BOUTON RETOUR PAGE PRÉCÉDENTE */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <button 
          onClick={() => router.back()} // ✅ Retourne à la liste des commandes
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition py-1 px-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          RETOUR
        </button>
        
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-green" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Flux Logistique</span>
        </div>
      </div>

      <div className="p-6">
        {/* VISUAL STEPPER */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
          {steps.map((s, idx) => (
            <div key={s} className="relative z-10">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                ${idx <= currentIdx ? "bg-brand-green text-white scale-110 shadow-lg" : "bg-white border-2 border-gray-200 text-gray-400"}
              `}>
                {idx < currentIdx ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</p>
              <p className="text-md font-black text-gray-800 uppercase">{status.replace(/_/g, " ")}</p>
            </div>
            {nextStatus && !canceledAt && (
               <div className="flex items-center gap-2">
                 <ChevronRight className="w-5 h-5 text-gray-300 animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-green uppercase">{nextStatus.replace(/_/g, " ")}</span>
               </div>
            )}
          </div>

          {canceledAt ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-xs font-bold uppercase">Commande annulée</p>
            </div>
          ) : (
            <>
              {err && <p className="text-xs text-red-500 font-bold">⚠️ {err}</p>}
              {msg && <p className="text-xs text-green-600 font-bold">✅ {msg}</p>}

              {nextStatus ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={goNext}
                  className={`
                    w-full py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all
                    flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50
                    ${currentStep.color}
                  `}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {currentStep.icon && <currentStep.icon className="w-5 h-5" />}
                      {currentStep.label}
                    </>
                  )}
                </button>
              ) : (
                <div className="py-4 rounded-xl bg-green-50 text-green-700 font-black text-center text-xs uppercase tracking-widest border border-green-100">
                  🎉 Livraison terminée
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}