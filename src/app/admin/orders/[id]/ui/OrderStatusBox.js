"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Truck, 
  PackageCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Package,
  ArrowLeft,
  Circle,
  Clock,
  Send
} from "lucide-react";

const nextStatusMap = {
  EFFECTUER: { 
    next: "EN_COURS_DE_LIVRAISON", 
    label: "Expédier le colis", 
    icon: Send, 
    color: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    desc: "Le colis est prêt et attend le livreur."
  },
  EN_COURS_DE_LIVRAISON: { 
    next: "LIVRER", 
    label: "Confirmer la réception", 
    icon: PackageCheck, 
    color: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    desc: "Le livreur est en route vers le client."
  },
  LIVRER: { 
    next: null, 
    label: "Commande clôturée", 
    icon: CheckCircle2, 
    color: "bg-gray-400",
    desc: "Transaction terminée avec succès."
  }
};

export default function OrderStatusBox({ orderId, status, canceledAt }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const steps = [
    { key: "EFFECTUER", label: "Préparation", icon: Clock },
    { key: "EN_COURS_DE_LIVRAISON", label: "Expédition", icon: Truck },
    { key: "LIVRER", label: "Livraison", icon: PackageCheck }
  ];

  const currentIdx = steps.findIndex(s => s.key === status);
  const currentStep = nextStatusMap[status] || {};
  const nextStatus = currentStep.next;
  const isCanceled = !!canceledAt;

  async function goNext() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      router.refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
      
      {/* HEADER ACTION BAR */}
      <div className="bg-gray-50/50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Workflow Management</span>
        </div>
      </div>

      <div className="p-8">
        {/* --- STEPPER VISUEL --- */}
        <div className="relative flex justify-between mb-12">
          {/* Ligne de fond */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-0 rounded-full" />
          {/* Ligne de progression active */}
          <div 
            className="absolute top-5 left-0 h-1 bg-orange-500 transition-all duration-1000 ease-out z-0 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
            style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const StepIcon = s.icon;

            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-4
                  ${isCompleted ? "bg-orange-500 border-orange-100 text-white scale-110" : 
                    isCurrent ? "bg-white dark:bg-gray-900 border-orange-500 text-orange-500 scale-125 shadow-xl" : 
                    "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-300"}
                `}>
                  {isCompleted ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                  
                  {isCurrent && !isCanceled && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* --- DÉTAILS DU STATUT --- */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">État Actuel</p>
                <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                  {status.replace(/_/g, " ")}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                  {currentStep.desc}
                </p>
              </div>
              {!isCanceled && nextStatus && (
                <div className="text-right">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Prochaine Étape</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
                    {nextStatus.replace(/_/g, " ")} <ChevronRight size={14} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- ACTIONS --- */}
          {isCanceled ? (
            <div className="p-5 bg-gray-900 rounded-2xl border-l-8 border-red-500 flex items-center gap-4 animate-in zoom-in">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-white font-black uppercase text-xs tracking-widest">Processus Interrompu</p>
                <p className="text-gray-400 text-[10px] font-medium">Cette commande a été annulée et ne peut plus progresser.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {err && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={14} /> {err}
                </div>
              )}

              {nextStatus ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={goNext}
                  className={`
                    w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs text-white transition-all
                    flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50
                    ${currentStep.color}
                  `}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {currentStep.icon && <currentStep.icon size={18} />}
                      {currentStep.label}
                    </>
                  )}
                </button>
              ) : (
                <div className="group relative py-6 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-black text-center text-xs uppercase tracking-widest overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Cycle de vente complété
                  </div>
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}