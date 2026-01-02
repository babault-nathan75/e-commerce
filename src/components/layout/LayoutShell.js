"use client";

import { useUIStore } from "@/store/ui";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function LayoutShell({ children, isAdmin }) {
  const { darkMode } = useUIStore();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1">
          <Header />
          <main className="p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
