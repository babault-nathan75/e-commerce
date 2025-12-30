"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Store,
  BookOpen,
  ShoppingCart,
  Heart,
  User,
  Package,
  Shield,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path) => pathname.startsWith(path);

  const iconBase =
    "w-5 h-5 transition-colors duration-200";

  const iconClass = (active) =>
    `${iconBase} ${
      active
        ? "text-brand-green"
        : "text-gray-600 hover:text-brand-orange"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-brand-green">my</span>
          <span className="text-brand-orange">-ecommerce</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/shop" title="Boutique">
            <Store className={iconClass(isActive("/shop"))} />
          </Link>

          <Link href="/library" title="Librairie">
            <BookOpen className={iconClass(isActive("/library"))} />
          </Link>

          <Link href="/cart" title="Panier">
            <ShoppingCart className={iconClass(isActive("/cart"))} />
          </Link>

          <Link href="/favorites" title="Favoris">
            <Heart className={iconClass(isActive("/favorites"))} />
          </Link>

          <Link href="/profile" title="Profil">
            <User className={iconClass(isActive("/profile"))} />
          </Link>

          {session?.user && (
            <Link href="/orders" title="Mes commandes">
              <Package className={iconClass(isActive("/orders"))} />
            </Link>
          )}

          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              title="Admin"
              className="
                p-2 rounded-lg
                bg-yellow-100 text-yellow-700
                hover:bg-yellow-200 transition
              "
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {!session ? (
            <>
              <Link href="/login" title="Connexion">
                <LogIn className="w-5 h-5 text-brand-green hover:text-brand-orange transition" />
              </Link>

              <Link
                href="/register"
                title="Inscription"
                className="
                  p-2 rounded-lg
                  bg-gradient-to-r from-orange-500 to-yellow-400
                  text-white
                  hover:scale-105 transition
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
                p-2 rounded-lg
                text-brand-orange
                hover:bg-orange-50 transition
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
