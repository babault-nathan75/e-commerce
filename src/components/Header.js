"use client";

import Link from "next/link";
import { useSession } from "next-auth/react"; // signOut n'était pas utilisé dans le rendu, je l'ai laissé importé au cas où
import { ShoppingCart, User, Shield, Menu } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";

// Fonction utilitaire pour les initiales (inchangée)
function formatUserName(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hydration fix
  useEffect(() => setMounted(true), []);

  // Effet pour détecter le scroll et ajouter une ombre
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300 border-b
        ${
          scrolled
            ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm"
            : "bg-white dark:bg-gray-950 border-transparent"
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Petit logo graphique optionnel ou juste le texte stylisé */}
            <div className="text-xl md:text-2xl font-extrabold tracking-tight ml-11">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 transition-all group-hover:brightness-110">
                Hebron
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-300 transition-all group-hover:brightness-110">
                Ivoire Shops
              </span>
            </div>
          </Link>

          {/* --- ACTIONS --- */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* PANIER */}
            <Link
              href="/cart"
              className="
                relative p-2.5 rounded-full transition-all duration-200
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-orange-600 dark:hover:text-orange-400
              "
              aria-label="Voir le panier"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {mounted && totalItems > 0 && (
                <span className="
                  absolute -top-0.5 -right-0.5 
                  flex items-center justify-center 
                  min-w-[20px] h-[20px] px-1 
                  rounded-full 
                  bg-gradient-to-r from-red-500 to-orange-500 
                  text-white text-[10px] font-bold shadow-sm
                  animate-in zoom-in duration-300
                ">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* SEPARATEUR VISUEL (Desktop seulement) */}
            <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {/* AUTHENTICATION / PROFIL */}
            {session?.user ? (
              <Link
                href="/profile"
                className="
                  group flex items-center gap-3 pl-1 pr-2 py-1 rounded-full
                  transition-all duration-200
                  hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700
                "
              >
                {/* Avatar Circle */}
                <div className="
                  relative w-9 h-9 rounded-full 
                  bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800
                  flex items-center justify-center
                  border-2 border-white dark:border-gray-900 shadow-sm
                  group-hover:scale-105 transition-transform
                ">
                  <User className="w-4 h-4 text-green-700 dark:text-green-300" />
                  {/* Status indicator dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                </div>
                
                {/* User Name (Desktop) */}
                <div className="hidden sm:flex flex-col items-start text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {formatUserName(session.user.name)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mon Compte</span>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="
                  flex items-center gap-2
                  px-5 py-2.5 rounded-full
                  bg-gradient-to-r from-green-600 to-emerald-600 
                  hover:from-green-500 hover:to-emerald-500
                  text-white text-sm font-semibold shadow-md shadow-green-500/20
                  transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                "
              >
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}

            {/* ADMIN LINK (Optionnel - Commenté mais stylisé) */}
            {/* {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className="
                  p-2 rounded-full
                  bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400
                  hover:bg-yellow-200 dark:hover:bg-yellow-900/50
                  transition-colors
                "
                title="Administration"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )} */}

          </div>
        </div>
      </div>
    </header>
  );
}