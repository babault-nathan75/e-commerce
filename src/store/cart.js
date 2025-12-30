import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, imageUrl, quantity }

      // 🔁 Toggle produit (Commander / Retirer)
      toggleItem: (product) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === product.productId
          );

          // ➖ Déjà présent → retirer complètement
          if (idx >= 0) {
            const items = [...state.items];
            items.splice(idx, 1);
            return { items };
          }

          // ➕ Pas présent → ajouter
          return {
            items: [...state.items, { ...product, quantity: 1 }]
          };
        }),

      // 🔢 Total articles pour badge panier
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      // (Optionnel) garder pour autres écrans
      increment: (productId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        });
      },

      decrement: (productId) => {
        set({
          items: get()
            .items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter((i) => i.quantity > 0)
        });
      },

      clear: () => set({ items: [] })
    }),
    { name: "my-ecommerce-cart" }
  )
);
