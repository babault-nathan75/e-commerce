"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isShop = pathname.startsWith("/shop");
  const isLibrary = pathname.startsWith("/library");

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-brand-orange">
          my-ecommerce
        </Link>

        <nav className="flex items-center gap-4">
          <Link className={isShop ? "text-brand-green font-semibold" : ""} href="/shop">
            Boutique
          </Link>
          <Link className={isLibrary ? "text-brand-green font-semibold" : ""} href="/library">
            Librairie
          </Link>

          <Link href="/cart">Panier</Link>
          <Link href="/favorites">Favoris</Link>
          <Link href="/profile">Profil</Link>

          {session?.user ? <Link href="/orders">Mes commandes</Link> : null}
          {session?.user?.isAdmin ? <Link href="/admin">Admin</Link> : null}

          {!session ? (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register">Inscription</Link>
            </>
          ) : (
            <button className="text-brand-orange" onClick={() => signOut({ callbackUrl: "/" })}>
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}