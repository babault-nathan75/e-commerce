"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { fetchLibraryProducts } from "./actions";
import { Search } from "lucide-react";
import { useEffect } from "react";

export default function LibraryClient({
  initialProducts,
  initialTotalPages,
  categories
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [filters, setFilters] = useState({});
  const [isPending, startTransition] = useTransition();
  const NEW_PRODUCT_DAYS = 7;

  const update = (extra = {}) => {
    startTransition(async () => {
      const res = await fetchLibraryProducts({ ...filters, ...extra });
      setProducts(res.products);
      setTotalPages(res.totalPages);
      if (extra.page) setPage(extra.page);
      setFilters((f) => ({ ...f, ...extra }));
    });
  };
  function isNewProduct(createdAt) {
    if (!createdAt) return false;
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= NEW_PRODUCT_DAYS;
  }

  return (
    <>
        {/* 🔍 SEARCH BAR */}
        <div className="mb-4">
            <div className="flex items-center bg-white border rounded-xl overflow-hidden shadow-sm">
                <input
                type="text"
                placeholder="Rechercher un livre..."
                className="flex-1 px-4 py-3 text-sm outline-none"
                onChange={(e) => {
                    const value = e.target.value;

                    // debounce léger côté client
                    clearTimeout(window.__librarySearchTimer);
                    window.__librarySearchTimer = setTimeout(() => {
                    update({ search: value, page: 1 });
                    }, 400);
                }}
                />
                <div className="px-4 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
            </div>
        </div>

      {/* 🎛️ FILTRES PREMIUM */}
      <div className="bg-white p-4 rounded-xl border shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

          <input
            placeholder="Prix min"
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            onBlur={(e) => update({ minPrice: e.target.value })}
          />

          <input
            placeholder="Prix max"
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            onBlur={(e) => update({ maxPrice: e.target.value })}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" onChange={(e) => update({ isNew: e.target.checked })} />
            Nouveautés
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" onChange={(e) => update({ isPromo: e.target.checked })} />
            Promotions
          </label>

          <select
            className="border rounded-lg px-3 py-2 text-sm col-span-2"
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
            <option value="popular">Popularité</option>
          </select>
        </div>
      </div>

      {/* 📦 PRODUITS */}
      {isPending && (
        <p className="text-center text-sm text-gray-500 mb-4">
          Chargement…
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link
            key={p._id}
            href={`/product/${p._id}`}
            className="group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition relative"
          >
            {/* 🏷️ BADGES */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {p.isOnSale && (
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  PROMO
                </span>
              )}
              {isNewProduct(p.createdAt) && (
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">
                    NOUVEAU
                </span>
            )}

            </div>

            <div className="aspect-[3/4] bg-gray-100 p-3 flex items-center justify-center">
              <img
                src={p.imageUrl}
                className="object-contain max-h-full transition-transform group-hover:scale-105"
              />
            </div>

            <div className="p-3">
              <h2 className="text-sm font-medium line-clamp-2">{p.name}</h2>
              <p className="font-bold mt-1">{p.price.toLocaleString()} FCFA</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => update({ page: i + 1 })}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                page === i + 1
                  ? "bg-emerald-700 text-white"
                  : "bg-white border"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
