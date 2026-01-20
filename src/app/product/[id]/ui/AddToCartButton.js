"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingBag, Trash2, Check, Plus } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({ product }) {
  const toggleItem = useCartStore((s) => s.toggleItem);
  const items = useCartStore((s) => s.items);
  const [isAnimate, setIsAnimate] = useState(false);

  const isInCart = items.some(
    (i) => i.productId === product.productId
  );

  const handleToggle = () => {
    setIsAnimate(true);
    toggleItem(product);
    // Petite animation de feedback
    setTimeout(() => setIsAnimate(false), 500);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        group relative flex items-center justify-center gap-3
        px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs
        transition-all duration-300 active:scale-95
        ${
          isInCart
            ? "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-red-500 hover:text-red-500"
            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl shadow-gray-200 dark:shadow-none hover:bg-brand-green hover:text-white"
        }
        ${isAnimate ? "scale-105" : "scale-100"}
      `}
    >
      {/* ICÔNE DYNAMIQUE */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isInCart ? (
          <div className="animate-in zoom-in duration-300">
            {/* Affiche une poubelle au hover sinon un check */}
            <Trash2 className="w-5 h-5 hidden group-hover:block transition-all" />
            <Check className="w-5 h-5 block group-hover:hidden transition-all text-green-500" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-2">
            <ShoppingBag className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* TEXTE DYNAMIQUE */}
      <span className="relative overflow-hidden">
        {isInCart ? (
          <span className="flex flex-col">
            <span className="group-hover:-translate-y-full transition-transform duration-300 block">
              Dans le panier
            </span>
            <span className="absolute top-0 left-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 block font-bold text-red-500">
              Retirer
            </span>
          </span>
        ) : (
          <span className="block animate-in slide-in-from-right-2">
            Ajouter au panier
          </span>
        )}
      </span>

      {/* EFFET DE PULSE LORS DE L'AJOUT */}
      {isInCart && !isAnimate && (
        <span className="absolute inset-0 rounded-2xl ring-2 ring-green-500 animate-ping opacity-20"></span>
      )}
    </button>
  );
}