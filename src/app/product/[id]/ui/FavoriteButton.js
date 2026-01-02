"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ productId }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Optionnel : charger l’état initial depuis /api/favorites
  }, []);

  async function toggle() {
    setMsg("");
    if (!session?.user) {
      setMsg("Connecte-toi pour ajouter aux favoris.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur favoris");
      setIsFavorite(data.isFavorite);
    } catch (e) {
      setMsg(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`
          flex items-center gap-2
          px-4 py-2 rounded-lg border
          font-semibold transition
          disabled:opacity-60
          ${
            isFavorite
              ? "border-gray-400 text-gray-700 bg-red-50 hover:bg-red-100"
              : "border-red-400 text-red-600 hover:border-brand-orange hover:text-brand-orange"
          }
        `}
      >
        <Heart
          className={`
            w-5 h-5 transition
            ${
              isFavorite
                ? "fill-red-500 text-gray-500"
                : "text-red-500"
            }
          `}
        />

        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>

      {msg ? (
        <p className="text-sm text-gray-700 mt-2">{msg}</p>
      ) : null}
    </div>
  );
}
