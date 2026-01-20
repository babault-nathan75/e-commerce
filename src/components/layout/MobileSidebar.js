"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; // ✅ Import de la fonction de sortie
import { 
  Menu, X, LayoutDashboard, Zap, ShieldCheck, Activity, LogOut 
} from "lucide-react";
import SidebarContent from "../SidebarContent"; 

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  return (
    <>
      {/* --- COMMANDE D'ACCÈS --- */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-2 z-[60] p-3 rounded-2xl bg-[#232f3e] text-white shadow-2xl border border-white/10 active:scale-90 transition-all"
        >
          <Menu size={18} />
        </button>
      )}

      {/* --- OVERLAY --- */}
      {open && (
        <div
          className="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-md z-[70] md:hidden animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* --- STRUCTURE DU TERMINAL --- */}
      <aside
        className={`
          fixed top-0 left-0 z-[80] h-full w-[290px] bg-[#232f3e] text-white
          shadow-2xl flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.32,0,0.07,1)]
          md:hidden border-r border-white/5
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                Hebron <span className="text-orange-500">Shops</span>
              </h2>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* CONTENU NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <SidebarContent />
        </div>

        {/* --- FOOTER : SESSION & DÉCONNEXION --- */}
        <div className="p-6 bg-[#1a232e] border-t border-white/5 space-y-4">
          
          {/* ✅ BOUTON DE DÉCONNEXION TACTIQUE */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quitter la Session
          </button>
        </div>
      </aside>
    </>
  );
}