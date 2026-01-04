"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function MobileSidebar({ isAdmin }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton burger */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed top-4 left-4 z-50
          p-2 rounded-lg
          bg-white shadow-md
          md:hidden
          border border-green-500
          hover:bg-gray-100 transition
          text-green-500
        "
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-full w-64
          bg-white shadow-xl
          transform transition-transform duration-300
          md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-brand-green">
            Menu
          </span>
          <button onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <Sidebar isAdmin={isAdmin} />
      </aside>
    </>
  );
}
