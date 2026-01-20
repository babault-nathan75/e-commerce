"use client";

import { useState } from "react";
import { 
  Trash2, 
  Star, 
  User as UserIcon, 
  MessageSquare, 
  Calendar, 
  AlertCircle, 
  Package,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AdminReviewList({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [err, setErr] = useState("");

  async function remove(id) {
    setErr("");
    if (!confirm("🚨 Voulez-vous vraiment supprimer définitivement cet avis client ?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Action impossible pour le moment");
        return;
      }
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      setErr("Erreur de connexion au serveur.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* --- ALERTE ERREUR --- */}
      {err && (
        <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl flex items-center gap-3 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-xs font-black uppercase tracking-widest">{err}</p>
        </div>
      )}

      {/* --- LISTE DES AVIS --- */}
      <div className="space-y-6">
        {reviews.map((r) => {
          const initials = r.userName ? r.userName.split(' ').map(n => n[0]).join('').toUpperCase() : "??";
          const isPositive = r.rating >= 4;

          return (
            <div 
              key={r._id} 
              className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-xl transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* INFO CLIENT & NOTE */}
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {initials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">{r.userName}</h3>
                      <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                        <Star size={10} fill="currentColor" /> {r.rating} / 5
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                       <span className="flex items-center gap-1.5"><Package size={12}/> Produit ID: {String(r.productId).slice(-6)}</span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <button 
                  onClick={() => remove(r._id)}
                  className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                  title="Supprimer définitivement"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* CONTENU DU COMMENTAIRE */}
              <div className="mt-8 relative">
                <div className="absolute -left-2 top-0 text-4xl text-gray-100 dark:text-gray-800 font-serif">“</div>
                <p className="relative z-10 text-gray-700 dark:text-gray-300 leading-relaxed text-base italic font-medium pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                  {r.comment}
                </p>
              </div>

              {/* FOOTER : LIENS CONTEXTUELS */}
              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <ShieldCheck size={14} /> Avis Vérifié Hebron
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest">
                    Voir le produit <ArrowRight size={12} />
                 </button>
              </div>
            </div>
          );
        })}

        {/* --- EMPTY STATE --- */}
        {reviews.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
            <div className="p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
                <MessageSquare size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Aucun retour client</h3>
            <p className="text-gray-400 text-sm font-medium mt-1">Vos clients n'ont pas encore partagé leurs impressions.</p>
          </div>
        )}
      </div>
    </div>
  );
}