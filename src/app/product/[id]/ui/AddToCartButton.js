"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingCart, Check, X } from "lucide-react";

export default function AddToCartButton({ product }) {
  const toggleItem = useCartStore((s) => s.toggleItem);
  const items = useCartStore((s) => s.items);

  const isInCart = items.some(
    (i) => i.productId === product.productId
  );

  return (
    <button
      onClick={() => toggleItem(product)}
      className={`
        group inline-flex items-center gap-2
        px-5 py-2.5 rounded-xl font-semibold
        transition-all duration-300
        ${
          isInCart
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-brand-green text-white hover:opacity-90"
        }
      `}
    >
      {/* Icône */}
      <span
        className={`
          flex items-center justify-center
          transition-transform duration-300
          group-hover:scale-110
        `}
      >
        {isInCart ? (
          <X className="w-4 h-4" />   // ➖ retirer
        ) : (
          <ShoppingCart className="w-4 h-4" /> // ➕ ajouter
        )}
      </span>

      {/* Texte */}
      <span>
        {isInCart ? "Retirer" : "Commander"}
      </span>
    </button>
  );
}
