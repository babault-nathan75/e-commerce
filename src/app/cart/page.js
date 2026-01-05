"use client";

import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const clear = useCartStore((s) => s.clear);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* ===== HEADER ===== */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-green">
              Mon panier
            </h1>
          </div>

          {/* ===== PANIER VIDE ===== */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
              <p className="text-gray-600 text-lg">
                Ton panier est vide 🛒
              </p>

              <div className="mt-6 flex justify-center gap-6">
                <Link
                  href="/shop"
                  className="font-semibold text-white bg-orange-500 px-4 py-2 rounded-xl border hover:bg-orange-200 transition hover:text-orange-700"
                >
                  Aller à la boutique
                </Link>
                <Link
                  href="/library"
                  className="font-semibold text-white bg-green-500 px-4 py-2 rounded-xl border hover:bg-green-200 transition hover:text-green-700"
                >
                  Aller à la librairie
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ===== LISTE ARTICLES ===== */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((i) => (
                  <div
                    key={i.productId}
                    className="bg-white rounded-2xl border shadow-sm p-4 flex gap-4 items-center"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                      <img
                        src={i.imageUrl}
                        alt={i.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {i.name}
                      </div>
                      <div className="text-brand-orange font-bold mt-1">
                        {i.price} FCFA
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrement(i.productId)}
                        className="w-8 h-8 rounded-full border hover:border-brand-orange font-bold"
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-semibold">
                        {i.quantity}
                      </span>

                      <button
                        onClick={() => increment(i.productId)}
                        className="w-8 h-8 rounded-full border hover:border-brand-orange font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== RÉCAP ===== */}
              <div className="bg-white rounded-2xl border shadow-sm p-6 h-fit">
                <h2 className="text-lg font-bold mb-4">
                  Récapitulatif
                </h2>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Articles</span>
                  <span>{totalItems}</span>
                </div>

                <div className="flex justify-between mt-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-green">
                    {totalPrice} FCFA
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/checkout"
                    className="
                      w-[45%] flex items-center justify-center gap-2
                      py-3 rounded-xl
                      border text-green-600 font-semibold
                      hover:opacity-90 transition 
                      hover:bg-green-300 transition
                    "
                  >
                    Commander
                  </Link>

                  <button
                    onClick={clear}
                    className="
                      w-[60%] flex items-center justify-center gap-2
                      py-3 rounded-xl
                      border text-red-600 font-semibold
                      hover:bg-red-300 transition
                    "
                  >
                    <Trash2 className="w-4 h-4" />
                    Vider le panier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
