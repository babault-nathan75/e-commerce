"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Heart, Loader2, AlertCircle } from "lucide-react";

export default function FavoriteButton({ productId }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // 1. Charger l'état initial au montage
  useEffect(() => {
    async function checkStatus() {
      if (!session?.user) return;
      try {
        const res = await fetch(`/api/favorites/check?productId=${productId}`);
        const data = await res.json();
        if (res.ok) setIsFavorite(data.isFavorite);
      } catch (err) {
        console.error("Erreur check favorite", err);
      }
    }
    checkStatus();
  }, [productId, session]);

  async function toggle() {
    setStatusMsg("");
    if (!session?.user) {
      setStatusMsg("Connexion requise");
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      
      setIsFavorite(data.isFavorite);
    } catch (e) {
      setStatusMsg("Erreur service");
      setTimeout(() => setStatusMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={loading}
        className={`
          group flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 
          font-bold text-sm tracking-tight transition-all duration-300
          active:scale-90 disabled:opacity-70
          ${
            isFavorite
              ? "bg-pink-50 border-pink-100 text-pink-600 dark:bg-pink-900/10 dark:border-pink-900/30 dark:text-pink-400 shadow-sm"
              : "bg-white border-gray-100 text-gray-600 hover:border-pink-200 hover:text-pink-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
          }
        `}
      >
        <div className="relative">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Heart
                className={`
                  w-5 h-5 transition-all duration-500 transform
                  ${isFavorite ? "fill-pink-500 text-pink-500 scale-110" : "text-current group-hover:scale-110"}
                  ${isHovered && !isFavorite ? "text-pink-400" : ""}
                `}
                strokeWidth={isFavorite ? 0 : 2.5}
              />
              {/* Effet d'explosion subtil lors du clic */}
              {isFavorite && (
                <span className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></span>
              )}
            </>
          )}
        </div>

        <span className="relative overflow-hidden">
          {isFavorite ? "Dans ma liste" : "Favori"}
        </span>
      </button>

      {/* TOOLTIP DE MESSAGE (LOGIN REQUIS / ERREUR) */}
      {statusMsg && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
            <AlertCircle size={12} className="text-orange-500" />
            {statusMsg}
          </div>
          {/* Petite flèche du tooltip */}
          <div className="w-2 h-2 bg-gray-900 dark:bg-white rotate-45 mx-auto -mt-1 shadow-xl"></div>
        </div>
      )}
    </div>
  );
}