import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      // --- ÉTAT DU TERMINAL ---
      sidebarOpen: true,
      darkMode: false,
      isMounted: false, // Utile pour éviter les erreurs d'hydratation Next.js

      // --- ACTIONS DE NAVIGATION ---
      
      // Bascule classique
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Force la fermeture (utile lors des transitions sur mobile)
      closeSidebar: () => 
        set({ sidebarOpen: false }),

      // Force l'ouverture
      openSidebar: () => 
        set({ sidebarOpen: true }),

      // --- CONFIGURATION ATMOSPHÉRIQUE ---
      
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      setDarkMode: (value) => 
        set({ darkMode: value }),

      // --- INITIALISATION ---
      setMounted: () => set({ isMounted: true }),
    }),
    { 
      name: "hebron-ui-protocol", // Clé persistante identifiée
      skipHydration: true,        // Recommandé pour Next.js (gestion manuelle via useEffect)
    }
  )
);