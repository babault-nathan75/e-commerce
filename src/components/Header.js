"use client";

import { useState } from "react";
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
  User,
  Menu,
  X
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
  const [open, setOpen] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems());
  const isActive = (path) => pathname.startsWith(path);

  const iconClass = (active) =>
    `w-5 h-5 transition ${
      active
        ? "text-brand-green"
        : "text-gray-600 group-hover:text-brand-orange"
    }`;

  const hoverWrap =
    "group relative p-2 rounded-lg hover:bg-gray-100 hover:scale-105 transition";

  const mobileLink =
    "block px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      {/* BARRE PRINCIPALE */}
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-brand-green">my</span>
          <span className="text-brand-orange">-ecommerce</span>
        </Link>

        {/* DESKTOP : ICÔNES */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/shop" className={hoverWrap}>
            <Store className={iconClass(isActive("/shop"))} />
          </Link>

          <Link href="/library" className={hoverWrap}>
            <BookOpen className={iconClass(isActive("/library"))} />
          </Link>

          <Link href="/cart" className={hoverWrap}>
            <ShoppingCart className={iconClass(isActive("/cart"))} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-gray-800 text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <Link href="/favorites" className={hoverWrap}>
            <Heart className={iconClass(isActive("/favorites"))} />
          </Link>

          {session?.user && (
            <Link href="/orders" className={hoverWrap}>
              <Package className={iconClass(isActive("/orders"))} />
            </Link>
          )}

          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="group p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {session?.user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-sm font-semibold">
                {formatUserName(session.user.name)}
              </span>
            </Link>
          )}

          {!session ? (
            <>
              <Link href="/login" className={hoverWrap}>
                <LogIn className="w-5 h-5 text-brand-green" />
              </Link>
              <Link
                href="/register"
                className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-400 text-white hover:scale-110 transition"
              >
                <UserPlus className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg text-brand-orange hover:bg-orange-50 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </nav>

        {/* BURGER MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      <div
        className={`
          md:hidden
          overflow-hidden
          transition-all duration-300
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <nav className="px-6 pb-4 flex flex-col gap-1">
          <Link href="/shop" className={mobileLink}>Boutique</Link>
          <Link href="/library" className={mobileLink}>Librairie</Link>
          <Link href="/cart" className={mobileLink}>
            Panier ({totalItems})
          </Link>
          <Link href="/favorites" className={mobileLink}>Favoris</Link>

          {session?.user && (
            <Link href="/orders" className={mobileLink}>Mes commandes</Link>
          )}

          {session?.user?.isAdmin && (
            <Link href="/admin" className={mobileLink}>Admin</Link>
          )}

          {session?.user && (
            <Link href="/profile" className={mobileLink}>Profil</Link>
          )}

          {!session ? (
            <>
              <Link href="/login" className={mobileLink}>Connexion</Link>
              <Link href="/register" className={mobileLink}>Inscription</Link>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${mobileLink} text-left text-brand-orange`}
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
