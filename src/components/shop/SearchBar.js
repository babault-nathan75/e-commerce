"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowRight, Package, Box, Zap } from "lucide-react";

export default function SearchBar({ products }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // LOGIQUE DE FILTRAGE "SYSTEM"
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = products
      .filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.category?.[0]?.toLowerCase().includes(q)
      )
      .slice(0, 6); // On limite à 6 pour garder un aspect compact
    
    setSuggestions(filtered);
  }, [query, products]);

  // FERMER SI ON CLIQUE AILLEURS
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const url = new URLSearchParams(params.toString());
    url.set("search", query);
    router.push(`/shop?${url.toString()}`);
    setIsFocused(false);
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl group">
      
      {/* --- CHAMP DE SAISIE TACTIQUE --- */}
      <form
        onSubmit={submit}
        className={`relative flex items-center transition-all duration-500 rounded-[1.5rem] border-2 ${
          isFocused 
          ? "bg-white border-orange-500 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] scale-[1.02]" 
          : "bg-gray-100/80 border-transparent hover:bg-gray-100"
        }`}
      >
        <div className="pl-5 text-gray-400">
          <Search size={20} className={isFocused ? "text-orange-500" : ""} />
        </div>
        
        <input
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="RECHERCHER DANS L'INVENTAIRE HEBRON..."
          className="w-full bg-transparent px-4 py-4 outline-none text-[11px] font-black uppercase tracking-widest text-gray-800 placeholder:text-gray-400"
        />

        {query && (
          <button 
            type="button" 
            onClick={() => setQuery("")}
            className="pr-4 text-gray-300 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <button
          type="submit"
          className={`mr-2 p-2.5 rounded-xl transition-all ${
            isFocused ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-gray-200 text-gray-400"
          }`}
        >
          <ArrowRight size={18} />
        </button>
      </form>

      {/* --- AUTOCOMPLÉTION STYLE "DATABASE LOG" --- */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-[100] mt-3 w-full bg-[#232f3e] rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={12} className="text-orange-500" /> Résultats Suggérés
            </span>
            <span className="text-[9px] font-black text-orange-500/50 uppercase">{suggestions.length} Matchs</span>
          </div>

          <div className="p-2">
            {suggestions.map((p) => (
              <button
                key={p._id}
                onClick={() => {
                  router.push(`/product/${p._id}`);
                  setIsFocused(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
              >
                {/* APERÇU MINIATURE */}
                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex-shrink-0 p-1 group-hover:scale-110 transition-transform">
                  <img src={p.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-black px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded uppercase tracking-tighter">
                      {p.category?.[0] || "STOCK"}
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase italic">
                      ID-{p._id.slice(-4)}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                    {p.name}
                  </h4>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-orange-500">
                    {p.price?.toLocaleString()} <span className="text-[8px] opacity-60">FCFA</span>
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                    {p.stockAvailable > 0 ? `${p.stockAvailable} DISPO` : "ÉPUISÉ"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button 
            onClick={submit}
            className="w-full py-4 bg-white/5 hover:bg-orange-500 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.3em] transition-all"
          >
            Afficher tous les résultats du terminal
          </button>
        </div>
      )}
    </div>
  );
}