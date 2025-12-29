"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const clear = useCartStore((s) => s.clear);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Panier</h1>

      {items.length === 0 ? (
        <div className="mt-4">
          <p>Ton panier est vide.</p>
          <div className="mt-3 flex gap-3">
            <Link className="underline text-brand-orange" href="/shop">Aller à la boutique</Link>
            <Link className="underline text-brand-orange" href="/library">Aller à la librairie</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="border rounded p-3 flex gap-3 items-center">
                <img src={i.imageUrl} alt={i.name} className="w-20 h-20 object-cover rounded" />

                <div className="flex-1">
                  <div className="font-semibold">{i.name}</div>
                  <div className="text-brand-orange font-bold">{i.price} FCFA</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded border hover:border-brand-orange"
                    onClick={() => decrement(i.productId)}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center">{i.quantity}</span>
                  <button
                    className="px-3 py-1 rounded border hover:border-brand-orange"
                    onClick={() => increment(i.productId)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border rounded p-4">
            <div className="flex justify-between">
              <span>Total articles</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="flex justify-between mt-2">
              <span>Total</span>
              <strong className="text-brand-green">{totalPrice} FCFA</strong>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="px-4 py-2 rounded bg-brand-orange text-white hover:opacity-90"
                onClick={clear}
              >
                Vider le panier
              </button>

              <Link
                className="px-4 py-2 rounded bg-brand-green text-white hover:opacity-90"
                href="/checkout"
              >
                Passer la commande
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}