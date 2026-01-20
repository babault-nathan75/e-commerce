"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Heart, 
  Loader2, 
  ShoppingBag, 
  ArrowRight, 
  LogIn, 
  PackageOpen 
} from "lucide-react";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      if (!session?.user) {
        setLoadingData(false);
        return;
      }

      const res = await fetch("/api/favorites", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data.error || "Impossible de charger les favoris");
      } else {
        setFavorites(data.favorites || []);
      }
      setLoadingData(false);
    }

    load();
  }, [session]);

  // --- COMPOSANT : SKELETON LOADER ---
  const SkeletonCard = () => (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4 animate-pulse">
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl w-full"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
  );

  // --- COMPOSANT : HEADER ---
  const Header = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <Heart className="text-pink-500 fill-pink-500" size={28} />
          Ma Wishlist
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Retrouvez ici tous vos coups de cœur.
        </p>
      </div>
      {favorites.length > 0 && (
        <span className="px-4 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 text-sm font-bold border border-pink-100 dark:border-pink-900/30">
          {favorites.length} article{favorites.length > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );

  // 1. LOADING STATE (Session ou Data)
  if (status === "loading" || (session?.user && loadingData)) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. NOT LOGGED IN
  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connectez-vous</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Sauvegardez vos articles préférés pour les retrouver plus tard.
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-transform hover:scale-[1.02]"
            >
              <LogIn size={18} /> Se connecter
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          
          <Header />

          {err && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
              {err}
            </div>
          )}

          {/* 3. EMPTY STATE */}
          {!loadingData && favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 border-dashed">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <PackageOpen size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Votre liste est vide</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-center">
                Explorez notre catalogue et cliquez sur le cœur pour ajouter des articles ici.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                <ShoppingBag size={18} />
                Explorer la boutique
              </Link>
            </div>
          ) : (
            /* 4. FAVORITES GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((p) => (
                <Link
                  key={p._id}
                  href={`/product/${p._id}`}
                  className="
                    group relative flex flex-col
                    bg-white dark:bg-gray-900 
                    rounded-2xl border border-gray-200 dark:border-gray-800
                    overflow-hidden
                    transition-all duration-300
                    hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 hover:-translate-y-1
                    hover:border-orange-200 dark:hover:border-orange-900/50
                  "
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 p-6 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="
                        w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal
                        transition-transform duration-500 group-hover:scale-110
                      "
                    />
                    {/* Overlay Action */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 bg-white dark:bg-black text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            Voir le détail
                        </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-auto group-hover:text-orange-500 transition-colors">
                      {p.name}
                    </h2>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="font-black text-lg text-gray-900 dark:text-white">
                        {p.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
                      </span>
                      <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}