"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; 
import { ShoppingCart, User, Shield, Menu } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";

function formatUserName(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 1. Hydration fix: On attend que le client soit prêt
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. ÉTAPE CRUCIALE : Si le composant n'est pas monté, on ne rend rien.
  // Cela évite l'erreur 500 ou les bugs d'affichage au chargement.
  if (!mounted) return null;

  // 3. Masquage stratégique (Gastronomie & Admin)
  // On masque le header sur le tunnel de commande gastronomie et le dashboard admin
  if (pathname?.startsWith("/gastronomie") || pathname?.startsWith("/admin")) {
    return null;
  }

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
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-xl md:text-2xl font-extrabold tracking-tight ml-11">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 transition-all group-hover:brightness-110">
                Hebron
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 transition-all group-hover:brightness-110">
                Ivoire Shops
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold shadow-sm animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {session?.user ? (
              <Link
                href="/profile"
                className="group flex items-center gap-3 pl-1 pr-2 py-1 rounded-full transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-200"
              >
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 text-green-700" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden sm:flex flex-col items-start text-sm">
                  <span className="font-semibold text-gray-700 transition-colors">
                    {formatUserName(session.user.name)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mon Compte</span>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}