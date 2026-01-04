"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

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

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="p-6">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-brand-green">
            Mes favoris
          </h1>
          <p className="mt-3 text-gray-700">Connexion requise.</p>
          <Link
            href="/login"
            className="inline-block mt-3 font-semibold text-brand-orange underline"
          >
            Se connecter
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-brand-green">
            Mes favoris
          </h1>

          {err && (
            <p className="mt-2 text-red-600 font-medium">
              {err}
            </p>
          )}

          {/* LISTE DES FAVORIS */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p._id}`}
                className="
                  group rounded-2xl bg-white border
                  shadow-sm hover:shadow-xl
                  hover:-translate-y-1 transition
                  overflow-hidden
                "
              >
                <div className="h-56 bg-gray-100 flex items-center justify-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="
                      max-h-full max-w-full object-contain
                      group-hover:scale-105 transition
                    "
                  />
                </div>

                <div className="p-4 space-y-1">
                  <h2 className="font-semibold line-clamp-2 text-gray-800">
                    {p.name}
                  </h2>
                  <div className="font-extrabold text-brand-orange">
                    {p.price} FCFA
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {favorites.length === 0 && (
            <p className="mt-8 text-gray-600">
              Aucun favori pour le moment.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
