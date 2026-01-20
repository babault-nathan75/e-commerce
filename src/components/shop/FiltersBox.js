"use client";

import { SlidersHorizontal, RotateCcw, DollarSign, Layers, ChevronDown } from "lucide-react";

export default function FiltersBox({ filters, setFilters }) {
  
  // Fonction pour réinitialiser les paramètres
  const resetFilters = () => {
    setFilters({ min: "", max: "", channel: "" });
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-28 transition-all">
      
      {/* --- HEADER TECHNIQUE --- */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#232f3e] text-white rounded-2xl shadow-lg shadow-gray-200">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tighter italic text-gray-900">
              Paramètres <span className="text-orange-500">Filtres</span>
            </h3>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Affinage Query v2.5</p>
          </div>
        </div>
        
        <button 
          onClick={resetFilters}
          className="p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all group"
          title="Réinitialiser"
        >
          <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
        </button>
      </div>

      <div className="space-y-8">
        
        {/* --- SECTION : BUDGET --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <DollarSign size={14} className="text-orange-500" />
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Fourchette Budget</label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <input
                type="number"
                placeholder="MIN"
                value={filters.min}
                onChange={(e) => setFilters({ ...filters, min: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
              <input
                type="number"
                placeholder="MAX"
                value={filters.max}
                onChange={(e) => setFilters({ ...filters, max: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-xs font-black text-gray-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* --- SECTION : CANAL --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers size={14} className="text-orange-500" />
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Flux d'Origine</label>
          </div>
          
          <div className="relative group">
            <select
              value={filters.channel}
              onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
              className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all cursor-pointer"
            >
              <option value="">Tous les flux</option>
              <option value="shop">🛒 Boutique Shop</option>
              <option value="library">📚 Librairie PDF</option>
            </select>
            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" />
          </div>
        </div>

        {/* --- STATUS FOOTER --- */}
        <div className="pt-6 border-t border-dashed border-gray-100">
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] font-black text-gray-300 uppercase">État Système</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase">Actif</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}