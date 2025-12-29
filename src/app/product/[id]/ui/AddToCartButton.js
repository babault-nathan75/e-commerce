"use client";

import { useCartStore } from "@/store/cart";

export default function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      className="px-4 py-2 rounded bg-brand-green text-white hover:opacity-90"
      onClick={() => addItem(product)}
    >
      Commander
    </button>
  );
}