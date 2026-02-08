"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";
import { verifyPayment } from "@/lib/actions/order"; 
import { useRouter } from "next/navigation";

export default function PaymentVerificationControl({ orderId, proofUrl, status }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!confirm("Confirmer la réception des fonds ? Cela marquera la commande comme prête au retrait.")) return;
    
    setLoading(true);
    try {
      const res = await verifyPayment(orderId);
      if (res.success) {
        // On force un rafraîchissement pour voir le nouveau statut immédiatement
        router.refresh(); 
      } else {
        alert("Erreur: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur technique lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    "EN_ATTENTE": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "VALIDE": "bg-green-100 text-green-700 border-green-200",
    "REJETE": "bg-red-100 text-red-700 border-red-200",
    "NON_REQUIS": "bg-gray-100 text-gray-500 border-gray-200"
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-500/5 border-2 border-orange-100 relative overflow-hidden">
      {/* Décoration d'arrière-plan */}
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <CheckCircle2 size={100} className="text-orange-500" />
      </div>

      <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        Vérification Retrait
      </h3>

      <div className="space-y-6 relative z-10">
        
        {/* Badge de Statut */}
        <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs uppercase tracking-wide ${statusColors[status] || statusColors["NON_REQUIS"]}`}>
            {status === "VALIDE" && <CheckCircle2 size={16} />}
            {status === "REJETE" && <XCircle size={16} />}
            {status === "EN_ATTENTE" && <Loader2 size={16} className="animate-spin" />}
            Statut : {status ? status.replace("_", " ") : "INCONNU"}
        </div>

        {/* Image de la Preuve */}
        {proofUrl ? (
          <div className="group relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
            <img 
              src={proofUrl} 
              alt="Preuve de paiement" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-colors">
                  <Eye size={14} /> Voir l'original
               </a>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400 font-medium">
            Aucune capture d'écran fournie
          </div>
        )}

        {/* Bouton d'action Admin (Uniquement si En Attente) */}
        {status !== "VALIDE" && (
            <div className="grid grid-cols-1 gap-3">
            <button 
                onClick={handleVerify}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                {loading ? "Validation..." : "Confirmer le Paiement"}
            </button>
            </div>
        )}

        {status === "VALIDE" && (
             <div className="text-center">
                <p className="text-xs text-gray-400 font-medium">
                    Ce paiement a été vérifié manuellement le {new Date().toLocaleDateString()}.
                </p>
             </div>
        )}

      </div>
    </div>
  );
}