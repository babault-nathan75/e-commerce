"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ products }) {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();
    setSuggestions(
      products
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 5)
    );
  }, [query, products]);

  function submit(e) {
    e.preventDefault();
    const url = new URLSearchParams(params.toString());
    url.set("search", query);
    router.push(`/shop?${url.toString()}`);
    setSuggestions([]);
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={submit}
        className="flex items-center bg-gray-100 rounded-xl px-3 py-2"
      >
        <Search className="w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit…"
          className="ml-2 flex-1 bg-transparent outline-none text-sm"
        />
      </form>

      {/* AUTOCOMPLETE */}
      {suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow-lg">
          {suggestions.map((p) => (
            <button
              key={p._id}
              onClick={() => router.push(`/product/${p._id}`)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
