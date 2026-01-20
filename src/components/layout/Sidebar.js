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
  LogOut,
  Search,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;

  // Composant helper pour les liens
  const NavItem = ({ href, icon: Icon, label, activeMatch }) => {
    const isActive = activeMatch
      ? pathname.startsWith(activeMatch)
      : pathname === href;

    return (
      <Link
        href={href}
        className={`
          group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
          ${
            isActive
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
          }
        `}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-green-500 rounded-r-full" />
        )}
        <Icon
          className={`w-5 h-5 transition-colors ${
            isActive
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400"
          }`}
        />
        <span className="tracking-wide">{label}</span>
      </Link>
    );
  };

  const SectionTitle = ({ title }) => (
    <h3 className="px-4 mb-2 mt-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
      {title}
    </h3>
  );

  return (
    <aside 
      className="
        hidden md:flex flex-col w-72 
        h-screen sticky top-0 
        border-r border-gray-100 dark:border-gray-800 
        bg-white dark:bg-gray-950 
        transition-colors duration-300
      "
    >
      
      {/* --- MENU PRINCIPAL (SCROLLABLE SI TROP D'ITEMS) --- */}
      <div className="flex-1 px-3 py-6 overflow-y-auto scrollbar-hide">
        
        {/* LOGO AREA (Optionnel si pas dans le Header global, sinon on commence direct) */}
        
        <SectionTitle title="Explorer" />
        <div className="space-y-1">
          <NavItem href="/shop" icon={Store} label="Boutique" activeMatch="/shop" />
          <NavItem href="/library" icon={BookOpen} label="Librairie" activeMatch="/library" />
          <NavItem href="/favorites" icon={Heart} label="Favoris" activeMatch="/favorites" />
        </div>

        <SectionTitle title="Mon Espace" />
        <div className="space-y-1">
          {session?.user ? (
            <NavItem href="/orders" icon={Package} label="Mes Commandes" activeMatch="/orders" />
          ) : (
            <NavItem href="/order/track" icon={Search} label="Suivre une commande" activeMatch="/order/track" />
          )}

          {isAdmin && (
            <NavItem href="/admin" icon={Shield} label="Administration" activeMatch="/admin" />
          )}
        </div>
      </div>

      {/* --- FOOTER (AUTH) - TOUJOURS EN BAS --- */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 mt-auto">
        {!session ? (
          <div className="space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Link>
            
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Inscription
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 px-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                 {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {session.user.name || "Utilisateur"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="
                group flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm
                text-red-600 dark:text-red-400 
                hover:bg-red-50 dark:hover:bg-red-900/20 
                transition-all active:scale-95
              "
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}