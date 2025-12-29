"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function FavoriteButton({ productId }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // simple: on ne charge pas l’état initial ici (optionnel)
    // si tu veux l’état initial, on peut faire /api/favorites et chercher productId
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
        className="px-4 py-2 rounded border hover:border-brand-orange disabled:opacity-60"
      >
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
      {msg ? <p className="text-sm text-gray-700 mt-2">{msg}</p> : null}
    </div>
  );
}