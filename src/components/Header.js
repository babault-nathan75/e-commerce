"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Shield } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";

function formatUserName(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0]
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-xl font-extrabold">
          <span className="text-brand-green ml-14">my</span>
          <span className="text-brand-orange">-ecommerce</span>
        </Link>

        {/* ACTIONS (DESKTOP + MOBILE IDENTIQUE) */}
        <div className="flex items-center gap-3">
          {/* PANIER */}
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-gray-900 text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* PROFIL */}
          {session?.user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-green" />
              </div>
              <span className="hidden sm:block text-sm font-semibold">
                {formatUserName(session.user.name)}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 rounded-lg bg-brand-green text-white font-semibold hover:opacity-90"
            >
              Connexion
            </Link>
          )}

          {/* ADMIN ICON */}
          {/* {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              title="Admin"
            >
              <Shield className="w-5 h-5" />
            </Link>
          )} */}
        </div>
      </div>
    </header>
  );
}
