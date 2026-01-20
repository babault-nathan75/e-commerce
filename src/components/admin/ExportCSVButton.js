"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getInventoryCSVData } from "@/lib/actions/export";

export default function ExportCSVButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const result = await getInventoryCSVData();

    if (result.success) {
      // Création du Blob pour le téléchargement
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `hebron_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Erreur lors de l'extraction des données.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all group"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin text-emerald-500" />
      ) : (
        <Download size={14} className="text-gray-400 group-hover:text-emerald-500" />
      )}
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">
        {loading ? "Extraction..." : "Exporter CSV"}
      </span>
    </button>
  );
}