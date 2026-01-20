"use client";
import { useState } from "react";
import { Star, mousePointer2 } from "lucide-react";

export default function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);

  // Configuration des labels de feedback
  const labels = {
    1: "CRITIQUE",
    2: "INSUFFISANT",
    3: "NOMINAL",
    4: "OPTIMAL",
    5: "EXCELLENT"
  };

  return (
    <div className="group/input flex flex-col items-center gap-4 bg-gray-50 border border-gray-100 p-6 rounded-[2rem] shadow-inner">
      
      {/* --- LABEL DE STATUT --- */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          Niveau de retour :
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all duration-300 ${
          (hover || value) ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-gray-200 text-gray-400"
        }`}>
          {labels[hover || value] || "EN ATTENTE"}
        </span>
      </div>

      {/* --- MODULE D'ENTRÉE TACTILE --- */}
      <div className="flex gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
        {[1, 2, 3, 4, 5].map((i) => {
          const isHighlighted = i <= (hover || value);
          const isActive = i <= value;

          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(i)}
              className="relative outline-none transition-transform active:scale-90"
            >
              <Star
                size={28}
                className={`
                  transition-all duration-300
                  ${isHighlighted 
                    ? "fill-orange-500 text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                    : "text-gray-200 hover:text-gray-400"
                  }
                  ${isActive && !hover ? "animate-pulse" : ""}
                `}
              />
              
              {/* Effet de point de contact pour le clic */}
              {isActive && (
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-10 animate-ping pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* --- AIDE À LA SAISIE --- */}
      <div className="flex items-center gap-2 text-gray-300">
        <span className="h-[1px] w-8 bg-current" />
        <span className="text-[9px] font-bold uppercase tracking-tighter italic">
          Cliquez pour valider la métrique
        </span>
        <span className="h-[1px] w-8 bg-current" />
      </div>

    </div>
  );
}