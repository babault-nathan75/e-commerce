"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Store, BookOpen, Heart, Package, Shield, LogIn, UserPlus, LogOut, Search, ChevronRight } from "lucide-react";

export default function SidebarContent() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;

  const NavItem = ({ href, icon: Icon, label, activeMatch }) => {
    const isActive = activeMatch ? pathname.startsWith(activeMatch) : pathname === href;
    return (
      <Link
        href={href}
        className={`
          group relative flex items-center justify-between px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
          ${isActive 
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 italic" 
            : "text-gray-400 hover:bg-white/5 hover:text-white"}
        `}
      >
        <div className="flex items-center gap-4">
          <Icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-orange-500"} />
          <span>{label}</span>
        </div>
        {isActive && <ChevronRight size={14} className="animate-pulse" />}
      </Link>
    );
  };

  return (
    <div className="space-y-1">
      <h3 className="px-4 mb-3 mt-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Flux Navigation</h3>
      <NavItem href="/shop" icon={Store} label="Boutique" activeMatch="/shop" />
      <NavItem href="/library" icon={BookOpen} label="Librairie" activeMatch="/library" />
      <NavItem href="/favorites" icon={Heart} label="Mes Favoris" activeMatch="/favorites" />

      <h3 className="px-4 mb-3 mt-8 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Espace Opérateur</h3>
      {session?.user ? (
        <NavItem href="/orders" icon={Package} label="Commandes" activeMatch="/orders" />
      ) : (
        <NavItem href="/order/track" icon={Search} label="Suivi Colis" activeMatch="/order/track" />
      )}
      {isAdmin && <NavItem href="/admin" icon={Shield} label="Panel Contrôle" activeMatch="/admin" />}
    </div>
  );
}