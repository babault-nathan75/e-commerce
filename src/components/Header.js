"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Store,
  BookOpen,
  ShoppingCart,
  Heart,
  Package,
  Shield,
  LogIn,
  UserPlus,
  LogOut,
  User
} from "lucide-react";
import { useCartStore } from "@/store/cart";

function formatUserName(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const totalItems = useCartStore((s) => s.totalItems());

  const isActive = (path) => pathname.startsWith(path);

  const iconBase = "w-5 h-5 transition-all duration-200";

  const iconClass = (active) =>
    `${iconBase} ${
      active
        ? "text-brand-green"
        : "text-gray-600 group-hover:text-brand-orange"
    }`;

  const hoverWrap =
    "group relative p-2 rounded-lg hover:bg-gray-100 hover:scale-105 transition";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight hover:opacity-90 transition"
        >
          <span className="text-brand-green">my</span>
          <span className="text-brand-orange">-ecommerce</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/shop" title="Boutique" className={hoverWrap}>
            <Store className={iconClass(isActive("/shop"))} />
          </Link>

          <Link href="/library" title="Librairie" className={hoverWrap}>
            <BookOpen className={iconClass(isActive("/library"))} />
          </Link>

          {/* 🛒 PANIER AVEC BADGE */}
          <Link href="/cart" title="Panier" className={hoverWrap}>
            <ShoppingCart className={iconClass(isActive("/cart"))} />

            {totalItems > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  min-w-[18px] h-[18px]
                  px-1
                  rounded-full
                  bg-brand-orange
                  text-gray-700
                  text-[11px] font-bold
                  flex items-center justify-center
                "
              >
                {totalItems}
              </span>
            )}
          </Link>

          <Link href="/favorites" title="Favoris" className={hoverWrap}>
            <Heart className={iconClass(isActive("/favorites"))} />
          </Link>

          {session?.user && (
            <Link href="/orders" title="Mes commandes" className={hoverWrap}>
              <Package className={iconClass(isActive("/orders"))} />
            </Link>
          )}

          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              title="Admin"
              className="
                group p-2 rounded-lg
                bg-yellow-100 text-yellow-700
                hover:bg-yellow-200 hover:scale-105
                transition
              "
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {/* Profil utilisateur */}
          {session?.user && (
            <Link
              href="/profile"
              title="Mon profil"
              className="
                group flex items-center gap-2
                px-3 py-2 rounded-lg
                hover:bg-gray-100 hover:scale-105
                transition
              "
            >
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-green" />
              </div>

              <span className="text-sm font-semibold text-gray-700">
                {formatUserName(session.user.name)}
              </span>
            </Link>
          )}

          {/* Auth */}
          {!session ? (
            <>
              <Link href="/login" title="Connexion" className={hoverWrap}>
                <LogIn className="w-5 h-5 text-brand-green group-hover:text-brand-orange transition" />
              </Link>

              <Link
                href="/register"
                title="Inscription"
                className="
                  group p-2 rounded-lg
                  bg-gradient-to-r from-orange-500 to-yellow-400
                  text-white
                  hover:scale-110 hover:shadow-md
                  transition
                "
              >
                <UserPlus className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <button
              title="Déconnexion"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="
                group p-2 rounded-lg
                text-brand-orange
                hover:bg-orange-50 hover:scale-105
                transition
              "
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
