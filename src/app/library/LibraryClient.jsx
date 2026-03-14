"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchLibraryProducts } from "./actions";
import { Search, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const CHIP_BASE = "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border flex-shrink-0";

export default function LibraryClient({
  initialProducts = [],
  initialTotalPages = 1,
  categories = []
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [filters, setFilters] = useState({ sort: "newest" });
  const [isPending, startTransition] = useTransition();

  const update = (extra = {}) => {
    startTransition(async () => {
      const res = await fetchLibraryProducts({ ...filters, ...extra });
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
      if (extra.page) setPage(extra.page);
      setFilters((f) => ({ ...f, ...extra }));
    });
  };

  // --- LOGIQUE PAGINATION : 01, 02 ... Dernier ---
  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (page > 2 && page < totalPages - 1) {
        // Optionnel : afficher la page courante si elle n'est pas dans les extrêmes
        if (page !== 2) pages.push("...");
        if (!pages.includes(page)) pages.push(page);
      }
      pages.push("...", totalPages);
    }
    // Nettoyage des doublons si page est 1 ou 2
    return [...new Set(pages)];
  };

  return (
    <div className="space-y-12">
      
      {/* --- MOTEUR DE RECHERCHE & FILTRES --- */}
      <div className="sticky top-6 z-30 space-y-4">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white dark:border-gray-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="RECHERCHER DANS L'INDEX..."
                className="w-full pl-16 pr-6 py-5 bg-gray-50/50 dark:bg-black/50 rounded-2xl border-transparent focus:border-emerald-500 focus:ring-0 text-[11px] font-black uppercase tracking-widest transition-all"
                onChange={(e) => {
                  const val = e.target.value;
                  clearTimeout(window.__searchTimer);
                  window.__searchTimer = setTimeout(() => update({ search: val, page: 1 }), 400);
                }}
              />
            </div>

            <select 
              className="bg-gray-50/50 dark:bg-black/50 px-8 py-3 rounded-2xl border-transparent text-[10px] font-black uppercase tracking-widest focus:ring-emerald-500 cursor-pointer"
              onChange={(e) => update({ sort: e.target.value, page: 1 })}
            >
              <option value="newest">Derniers Ajouts</option>
              <option value="price_asc">Prix ↑</option>
              <option value="price_desc">Prix ↓</option>
            </select>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => update({ category: "", page: 1 })}
              className={`${CHIP_BASE} ${!filters.category ? "bg-gray-900 text-white border-gray-900 shadow-xl" : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-emerald-500"}`}
            >
              TOUT L'INDEX
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => update({ category: cat, page: 1 })}
                className={`${CHIP_BASE} ${filters.category === cat ? "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20" : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-emerald-500"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- GRID DE LIVRES (CADRES VERTICAUX) --- */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {products?.map((book) => (
          <div key={book._id} className="group flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-3xl hover:shadow-emerald-500/10 transition-all duration-500">
            
            {/* Image (Haut) */}
            <div className="relative aspect-[3/4] bg-gray-50 dark:bg-black overflow-hidden">
              <Image 
                src={book.imageUrl} 
                alt={book.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 p-2 rounded-xl border border-white/20">
                <Sparkles size={12} className="text-emerald-500" />
              </div>
            </div>

            {/* Contenu (Bas) */}
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-4">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">{book.category || 'Archive'}</p>
                <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase leading-snug italic line-clamp-2 group-hover:text-emerald-500 transition-colors">
                  {book.name}
                </h3>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div className="text-lg font-black text-gray-900 dark:text-white italic tracking-tighter">
                  {book.price.toLocaleString()} <span className="text-[9px] font-mono">CFA</span>
                </div>
                <Link href={`/product/${book._id}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all">
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION AVEC ELLIPSES --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-12">
          <button 
            disabled={page === 1}
            onClick={() => update({ page: page - 1 })}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-emerald-500 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            {renderPagination().map((p, i) => (
              p === "..." ? (
                <span key={`sep-${i}`} className="px-2 text-gray-400 font-black">...</span>
              ) : (
                <button 
                  key={p}
                  onClick={() => update({ page: p })}
                  className={`w-12 h-12 rounded-2xl text-[11px] font-black transition-all ${
                    page === p 
                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' 
                    : 'bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {String(p).padStart(2, '0')}
                </button>
              )
            ))}
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => update({ page: page + 1 })}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-emerald-500 disabled:opacity-20 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}