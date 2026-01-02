"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/store/ui";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-100 transition"
    >
      {darkMode ? <Sun /> : <Moon />}
    </button>
  );
}
