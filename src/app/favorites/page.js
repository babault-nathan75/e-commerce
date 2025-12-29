"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      if (!session?.user) return;
      const res = await fetch("/api/favorites", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Erreur");
        return;
      }
      setFavorites(data.favorites || []);
    }
    load();
  }, [session]);

  if (status === "loading") return <div>Chargement...</div>;

  if (!session?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Mes favoris</h1>
        <p className="mt-3">Connexion requise.</p>
        <Link className="underline text-brand-orange" href="/login">Se connecter</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Mes favoris</h1>
      {err ? <p className="text-red-600 mt-2">{err}</p> : null}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favorites.map((p) => (
          <Link key={p._id} href={`/product/${p._id}`} className="border rounded p-3 hover:border-brand-orange">
            <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover rounded" />
            <div className="mt-2 font-semibold">{p.name}</div>
            <div className="text-brand-orange font-bold">{p.price} FCFA</div>
          </Link>
        ))}
      </div>

      {favorites.length === 0 ? <p className="text-gray-600 mt-4">Aucun favori.</p> : null}
    </div>
  );
}