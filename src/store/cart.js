import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, imageUrl, quantity }

      addItem: (product) =>
  set((state) => {
    const idx = state.items.findIndex(
      (i) => i.productId === product.productId
    );

    if (idx >= 0) {
      const items = [...state.items];
      items[idx] = {
        ...items[idx],
        quantity: items[idx].quantity + 1
      };
      return { items };
    }

    return {
      items: [...state.items, { ...product, quantity: 1 }]
    };
  }),


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