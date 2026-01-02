import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      toggleDarkMode: () =>
        set((s) => ({ darkMode: !s.darkMode }))
    }),
    { name: "ui-settings" }
  )
);
