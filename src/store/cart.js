import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, imageUrl, quantity }

      addItem: (product) => {
        const items = get().items.slice();
        const idx = items.findIndex((i) => i.productId === product.productId);
        if (idx >= 0) items[idx].quantity += 1;
        else items.push({ ...product, quantity: 1 });
        set({ items });
      },

      increment: (productId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
          )
        });
      },

      decrement: (productId) => {
        set({
          items: get()
            .items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0)
        });
      },

      clear: () => set({ items: [] })
    }),
    { name: "my-ecommerce-cart" }
  )
);