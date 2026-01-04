"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  LogIn,
  UserPlus,
  User,
  // Menu,
  // X,
  Shield
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
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setOpen(false);
  }

  const mobileLink =
    "block w-full px-4 py-3 rounded-lg font-semibold text-gray-800 " +
    "hover:bg-orange-50 hover:text-brand-orange transition";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      {/* ===== BARRE PRINCIPALE ===== */}
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-brand-green ml-12">my</span>
          <span className="text-brand-orange">-ecommerce</span>
        </Link>

        {/* ACTIONS DESKTOP */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100">
            <ShoppingCart className="w-5 h-5 text-gray-700" />

            {/* ✅ Badge client-only */}
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-gray-900 text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {session?.user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-sm font-semibold">
                {formatUserName(session.user.name)}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="p-2 rounded-lg hover:bg-gray-100">
                <LogIn className="w-5 h-5 text-brand-green" />
              </Link>
              <Link
                href="/register"
                className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-400 text-white hover:scale-110 transition"
              >
                <UserPlus className="w-5 h-5" />
              </Link>
            </>
          )}
        </div>

        {/* 🍔 BURGER MOBILE */}
        {/* <button
          onClick={() => setOpen(!open)}
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button> */}
      </div>

      {/* ===== MENU MOBILE ===== */}
      <div className="mx-[80%]">
        {session?.user && (
            <>
            <div className="absolute top-0 right-25">
              <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5 text-green-500" />

                {/* ✅ Badge client-only */}
                {mounted && totalItems > 0 && (
                  <span className="relative -top-8.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-green-500 text-[11px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            <div className="absolute top-3 right-4">
                <Link
                href="/profile"
                className="flex items-center pr-2 py-1 rounded-lg hover:bg-gray-100 border border-green-500"
              >
                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-md font-bold text-green-500">
                  {formatUserName(session.user.name)}
                </span>
              </Link>
            </div>
            </>
          )}

          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
      </div>
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 space-y-2">

          <Link href="/shop" className={mobileLink}>Boutique</Link>
          <Link href="/library" className={mobileLink}>Librairie</Link>

          <Link href="/cart" className={mobileLink}>
            Panier {mounted ? `(${totalItems})` : ""}
          </Link>

          <Link href="/favorites" className={mobileLink}>Favoris</Link>

          {!session ? (
            <>
              <Link href="/login" className={mobileLink}>Connexion</Link>
              <Link href="/register" className={mobileLink}>Inscription</Link>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-brand-orange hover:bg-orange-50 transition"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
