import { create } from "zustand";
import { persist } from "zustand/proxy";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // --- ÉTAT INITIAL ---
      items: [], // Structure: { productId, name, price, imageUrl, quantity }

      // --- LOGIQUE DE COMMANDE (TOGGLE) ---
      // Utilisé pour l'ajout/retrait rapide depuis les listes
      toggleItem: (product) => {
        const { items } = get();
        const index = items.findIndex((i) => i.productId === product.productId);

        if (index >= 0) {
          // STATUS: RETRAIT DU FLUX
          const updatedItems = items.filter((i) => i.productId !== product.productId);
          set({ items: updatedItems });
        } else {
          // STATUS: INSCRIPTION DANS L'INVENTAIRE
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      // --- CALCULATEURS DE DONNÉES (SELECTORS) ---
      
      // Retourne le nombre total d'unités pour le badge du header
      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Calcule la valeur totale de la session (FCFA)
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      // Vérifie si un produit est déjà présent (pour le style des boutons)
      isInCart: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      // --- CONTRÔLES DE QUANTITÉ ---
      
      increment: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decrement: (productId) => {
        const { items } = get();
        const product = items.find((i) => i.productId === productId);

        if (product && product.quantity > 1) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          });
        } else {
          // Si la quantité tombe à 0, on purge l'item
          set({ items: items.filter((item) => item.productId !== productId) });
        }
      },

      // --- RÉINITIALISATION ---
      clear: () => {
        // ACTION: PURGE COMPLÈTE DU TERMINAL
        set({ items: [] });
      },
    }),
    { 
      name: "hebron-terminal-storage", // Nom technique pour le localStorage
      getStorage: () => localStorage, 
    }
  )
);