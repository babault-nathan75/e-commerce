"use client";
import { Star, MessageSquare, ShieldCheck } from "lucide-react";

export default function StarRating({
  value = 0,
  count = 0,
  size = 14
}) {
  const rounded = Math.round(value * 10) / 10;

  // Détermination de la couleur de statut basée sur la note
  const getStatusColor = () => {
    if (rounded >= 4) return "text-emerald-500 bg-emerald-50";
    if (rounded >= 3) return "text-orange-500 bg-orange-50";
    return "text-rose-500 bg-rose-50";
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-2 pr-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      
      {/* --- BADGE DE NOTE NUMÉRIQUE --- */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-current font-black text-xs italic tracking-tighter ${getStatusColor()}`}>
        {rounded > 0 ? (
          <>
            <ShieldCheck size={14} />
            <span>{rounded.toFixed(1)}</span>
          </>
        ) : (
          <span className="text-[10px] uppercase italic">N/A</span>
        )}
      </div>

      {/* --- GROUPE D'ÉTOILES TACTIQUES --- */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = i <= Math.floor(rounded);
          const isPartial = i === Math.ceil(rounded) && rounded % 1 !== 0;

          return (
            <div key={i} className="relative">
              <Star
                size={size}
                className={`${
                  isActive 
                  ? "fill-orange-500 text-orange-500 shadow-orange-500/20" 
                  : "text-gray-200 fill-gray-50"
                } transition-all duration-300`}
              />
              {/* Effet de brillance pour les étoiles actives */}
              {isActive && (
                <div className="absolute inset-0 bg-orange-400 blur-lg opacity-20" />
              )}
            </div>
          );
        })}
      </div>

      {/* --- COMPTEUR DE RETOURS --- */}
      <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
        <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg">
          <MessageSquare size={12} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest leading-none">
            {count} Avis
          </span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
            User Feedback
          </span>
        </div>
      </div>

    </div>
  );
}