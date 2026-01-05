"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, BookOpen, Image as ImageIcon, ArrowLeft } from "lucide-react";

// Configuration des catégories par canal
const CATEGORIES_MAP = {
  shop: ["Électronique", "Mode", "Maison", "Beauté", "Informatique"],
  library: ["Développement Personnel", "Business", "Scolaire", "Romans", "PDF"]
};

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    channel: "shop",
    category: "Électronique", // Valeur par défaut initiale
    productType: "physical"
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Mise à jour du canal et reset de la catégorie correspondante
  const handleChannelChange = (val) => {
    setForm({ 
      ...form, 
      channel: val, 
      category: CATEGORIES_MAP[val][0], // Prend la 1ère catégorie de la nouvelle liste
      productType: val === "library" ? "digital" : "physical" // Préréglage logique
    });
  };

  async function uploadImage() {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload échoué");
    return data.url;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!file) throw new Error("Image obligatoire");
      const imageUrl = await uploadImage();

      const payload = {
        ...form,
        price: Number(form.price),
        imageUrl,
        category: [form.category] // On l'envoie sous forme de tableau comme prévu dans ton modèle
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Création échouée");
      router.push("/admin/products");
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-black transition">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-3xl font-black text-gray-800 mb-8">Ajouter un article</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm" onSubmit={onSubmit}>
        
        {/* SECTION INFOS DE BASE */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nom du produit</label>
            <input
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex: MacBook Pro 14"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Prix (FCFA)</label>
            <input
              required
              type="number"
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
            <textarea
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition min-h-32"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION CLASSIFICATION */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Canal</label>
              <select
                className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-bold text-sm"
                value={form.channel}
                onChange={(e) => handleChannelChange(e.target.value)}
              >
                <option value="shop">🛒 Boutique</option>
                <option value="library">📚 Librairie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
              <select
                className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-bold text-sm"
                value={form.productType}
                onChange={(e) => setForm({ ...form, productType: e.target.value })}
              >
                <option value="physical">Physique</option>
                <option value="digital">Digital / PDF</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Catégorie</label>
            <select
              className="w-full border-gray-200 rounded-xl px-4 py-3 bg-white border-2 border-brand-green/20 font-medium"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES_MAP[form.channel].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Image du produit</label>
            <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-brand-green transition bg-gray-50">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <ImageIcon className="w-8 h-8 text-gray-300 mb-2 group-hover:text-brand-green" />
              <span className="text-xs text-gray-500">{file ? file.name : "Cliquez pour uploader"}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          {err && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4 border border-red-100">{err}</div>}
          
          <button
            className="w-full bg-brand-orange hover:bg-orange-600 hover:text-white text-orange-500 border border-orange-500 py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 transition-all disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? "CRÉATION EN COURS..." : "PUBLIER L'ARTICLE"}
          </button>
        </div>
      </form>
    </div>
  );
}