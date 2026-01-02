"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Store,
  BookOpen,
  Heart,
  Package,
  Shield,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = !!session?.user?.isAdmin;

  const item = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition
     ${
       pathname.startsWith(path)
         ? "bg-brand-green text-orange-500"
         : "text-gray-700 hover:bg-orange-100 hover:text-brand-orange"
     }`;

  return (
    <aside className="w-64 min-h-screen border-r bg-white px-3 py-6">
      <nav className="space-y-1">

        {/* NAVIGATION PUBLIQUE */}
        <Link href="/shop" className={item("/shop")}>
          <Store className="w-5 h-5" />
          Boutique
        </Link>

        <Link href="/library" className={item("/library")}>
          <BookOpen className="w-5 h-5" />
          Librairie
        </Link>

        <Link href="/favorites" className={item("/favorites")}>
          <Heart className="w-5 h-5" />
          Favoris
        </Link>

        {/* UTILISATEUR CONNECTÉ */}
        {session?.user && (
          <Link href="/orders" className={item("/orders")}>
            <Package className="w-5 h-5" />
            Commandes
          </Link>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <Link href="/admin" className={item("/admin")}>
            <Shield className="w-5 h-5" />
            Tableau de bord
          </Link>
        )}

        <hr className="my-4" />

        {/* AUTH */}
        {!session ? (
          <>
            <Link href="/login" className={item("/login")}>
              <LogIn className="w-5 h-5" />
              Connexion
            </Link>

            <Link href="/register" className={item("/register")}>
              <UserPlus className="w-5 h-5" />
              Inscription
            </Link>
          </>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium
                       text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        )}
      </nav>
    </aside>
  );
}
