"use client";

import Link from "next/link";
import { Search, Flame, PackageOpen, Zap, ShoppingCart } from "lucide-react";
import BannerCarousel from "@/components/shop/BannerCarousel";
import { useRouter, usePathname } from "next/navigation";

// --- Moteur de Style Hebron ---
const CHIP_BASE = "flex-shrink-0 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border whitespace-nowrap";
const CHIP_ACTIVE = `${CHIP_BASE} bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/20 dark:bg-white dark:text-gray-900 dark:border-white`;
const CHIP_INACTIVE = `${CHIP_BASE} bg-white text-gray-400 border-gray-100 hover:border-orange-500 hover:text-orange-500 dark:bg-gray-900 dark:text-gray-500 dark:border-gray-800 dark:hover:border-orange-400`;

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
});

// Helper pour générer une pagination moderne
const generatePagination = (currentPage, totalPages) => {
  // Si on a 5 pages ou moins, on affiche tout (1 2 3 4 5)
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Si on est au début (ex: Page 1, 2 ou 3) -> 1 2 3 ... 10
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  // Si on est à la fin (ex: Page 8, 9, 10 sur 10) -> 1 ... 8 9 10
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // Si on est au milieu (ex: Page 5 sur 10) -> 1 ... 4 5 6 ... 10
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

export default function ShopClient({ initialData, search, category, page }) {
  const router = useRouter();
  const pathname = usePathname();
  const { categories, banners, products, total, totalPages } = initialData;

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search");
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (category) params.set("category", category);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pb-20 transition-colors duration-500">
      
      {/* --- NAVIGATION TACTIQUE (FIX MOBILE ABSOLU) --- */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-900 shadow-sm w-full">
        
        {/* 1. Zone Recherche (Contenue avec padding) */}
        <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6 pb-4">
          <form onSubmit={handleSearch} className="relative group max-w-3xl mx-auto w-full">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="RECHERCHER DANS L'INVENTAIRE..."
              className="block w-full pl-12 pr-4 py-3 md:pl-14 md:py-4 bg-gray-50 dark:bg-gray-900 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-orange-500/5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all shadow-inner"
            />
          </form>
        </div>

        {/* 2. Zone Catégories (Scroll "Edge-to-Edge" fluide et 100% sécurisé) */}
        <div className="w-full pb-4 md:pb-6">
          <div 
            className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 max-w-7xl mx-auto w-full"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <Link href="/shop" className={`${!category ? CHIP_ACTIVE : CHIP_INACTIVE} shrink-0`}>
              TOUT VOIR
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}${search ? `&search=${search}` : ""}`}
                className={`${category === cat ? CHIP_ACTIVE : CHIP_INACTIVE} shrink-0`}
              >
                {cat}
              </Link>
            ))}
            {/* Petit espace invisible à la fin pour que le dernier bouton ne colle pas à l'écran */}
            <div className="w-2 shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {!category && !search && banners.length > 0 && (
          <div className="mb-14 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-500/10 border border-white dark:border-gray-900">
             <BannerCarousel banners={banners} />
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-l-4 border-orange-500 pl-6">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Hebron Inventory</p>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
              {search ? `Query: ${search}` : category ? category : "Nos Articles"}
            </h1>
          </div>
          <div className="bg-gray-900 dark:bg-white px-4 py-2 rounded-xl self-start md:self-auto">
             <p className="text-[10px] font-black text-white dark:text-gray-900 uppercase tracking-widest">
               {total} Unités détectées
             </p>
          </div>
        </div>

        {/* GRID PRODUITS */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {products.map((p) => {
              const realStock = p.stockAvailable ?? p.stock ?? 0;
              const isOutOfStock = realStock <= 0;
              const lowStock = realStock > 0 && realStock <= 5;
              const isNew = new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

              return (
                <Link
                  key={p._id.toString()}
                  href={`/product/${p._id}`}
                  className={`group relative flex flex-col bg-white dark:bg-gray-900 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 ${isOutOfStock ? 'opacity-60' : 'hover:-translate-y-3 hover:shadow-3xl hover:shadow-orange-500/20'}`}
                >
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col gap-2">
                    {isNew && !isOutOfStock && (
                      <div className="bg-emerald-500 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Zap size={10} fill="currentColor" /> Nouveau
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                    {isOutOfStock ? (
                      <div className="bg-gray-900 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg uppercase tracking-widest">Épuisé</div>
                    ) : lowStock ? (
                      <div className="bg-orange-500 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg uppercase tracking-widest animate-pulse flex items-center gap-1">
                        <Flame size={10} fill="currentColor" /> Vite !
                      </div>
                    ) : null}
                  </div>

                  <div className="relative aspect-[4/5] w-full bg-[#f9fafb] dark:bg-gray-800/50 p-4 md:p-8 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4 md:p-6 flex flex-col flex-1">
                    <h2 className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-100 line-clamp-2 uppercase tracking-tight mb-3 md:mb-4 group-hover:text-orange-500 transition-colors">
                      {p.name}
                    </h2>
                    
                    <div className="mt-auto space-y-4 md:space-y-5">
                      <div className="text-lg md:text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">
                        {currencyFormatter.format(p.price)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em]">
                          <span className={isOutOfStock ? "text-rose-500" : lowStock ? "text-orange-500" : "text-emerald-500"}>
                            {isOutOfStock ? "Rupture" : lowStock ? "Critique" : "Disponible"}
                          </span>
                          {!isOutOfStock && <span className="text-gray-400 font-mono">{realStock} U.</span>}
                        </div>
                        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          {!isOutOfStock && (
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${lowStock ? 'bg-orange-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min((realStock / 15) * 100, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <PackageOpen size={64} className="text-gray-200 dark:text-gray-800 mb-6" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Aucun résultat</h3>
            <Link href="/shop" className="px-10 py-4 mt-10 bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-colors">
              Réinitialiser les filtres
            </Link>
          </div>
        )}

        {/* --- PAGINATION MODERNE --- */}
        {totalPages > 1 && (
          <div className="mt-16 md:mt-20 flex flex-wrap justify-center items-center gap-2 md:gap-3">
            {generatePagination(page, totalPages).map((item, index) => {
              // Rendu des points de suspension
              if (item === "...") {
                return (
                  <span 
                    key={`ellipsis-${index}`} 
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-400 font-black tracking-widest"
                  >
                    ...
                  </span>
                );
              }

              // Rendu des boutons cliquables
              return (
                <Link
                  key={item}
                  href={`/shop?page=${item}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl font-black text-xs transition-all
                    ${page === item 
                      ? "bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-110" 
                      : "bg-white dark:bg-gray-900 text-gray-400 hover:text-orange-500 border border-gray-100 dark:border-gray-800"
                    }
                  `}
                >
                  {String(item).padStart(2, '0')}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}