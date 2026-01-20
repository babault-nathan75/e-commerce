"use client";

import { Moon, Sun, Monitor, Zap, Power } from "lucide-react";
import { useUIStore } from "@/store/ui";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 pl-4 rounded-[1.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md group">
      
      {/* --- LABEL TECHNIQUE --- */}
      <div className="flex flex-col items-start gap-0.5 border-r border-gray-100 pr-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Monitor size={12} className="group-hover:text-orange-500 transition-colors" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">System Vis</span>
        </div>
        <span className="text-[10px] font-black text-gray-900 uppercase italic tracking-tighter">
          Atmosphère
        </span>
      </div>

      {/* --- COMMUTATEUR TACTIQUE --- */}
      <button
        onClick={toggleDarkMode}
        className={`relative flex items-center w-20 h-10 rounded-xl p-1 transition-all duration-500 overflow-hidden ${
          darkMode ? "bg-[#232f3e]" : "bg-gray-200"
        }`}
      >
        {/* Curseur glissant avec effet de profondeur */}
        <div
          className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${
            darkMode 
              ? "translate-x-[calc(100%+0px)] bg-orange-500 shadow-orange-500/40" 
              : "translate-x-0 bg-white shadow-gray-400/20"
          }`}
        >
          {/* Effet de brillance interne sur le curseur */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 rounded-lg" />
        </div>

        {/* Icones superposées */}
        <div className="relative z-10 flex w-full h-full font-black">
          <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${!darkMode ? "text-[#232f3e] scale-110" : "text-gray-500 opacity-40"}`}>
            <Sun size={16} strokeWidth={3} />
          </div>
          <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${darkMode ? "text-white scale-110" : "text-gray-400 opacity-40"}`}>
            <Moon size={16} strokeWidth={3} />
          </div>
        </div>
      </button>

      {/* --- INDICATEUR DE STATUT "OPS" --- */}
      <div className="flex items-center gap-3 min-w-[80px]">
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full animate-ping absolute opacity-40 ${darkMode ? 'bg-orange-500' : 'bg-emerald-500'}`} />
          <div className={`w-2 h-2 rounded-full relative ${darkMode ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-0.5">Mode</span>
          <span className={`text-[10px] font-black uppercase tracking-tighter italic ${darkMode ? 'text-orange-500' : 'text-emerald-600'}`}>
            {darkMode ? "Dark Ops" : "Light Env"}
          </span>
        </div>
      </div>

    </div>
  );
}