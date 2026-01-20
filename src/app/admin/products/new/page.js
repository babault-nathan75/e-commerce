"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, ArrowLeft, Package, Loader2 } from "lucide-react";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  const router = useRouter();

  // États pour les données dynamiques
  const [allCategories, setAllCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: 0,
    description: "",
    channel: "shop",
    category: "",
    productType: "physical"
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [err, setErr] = useState("");

  // 1. CHARGEMENT DES CATÉGORIES DEPUIS LA BDD
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setAllCategories(data);
        
        // Sélectionner par défaut la première catégorie du canal "shop"
        const firstShopCat = data.find(c => c.channel === "shop");
        if (firstShopCat) {
          setForm(prev => ({ ...prev, category: firstShopCat.name }));
        }
      } catch (e) {
        setErr("Impossible de charger les catégories");
      } finally {
        setFetchingCats(false);
      }
    }
    fetchCats();
  }, []);

  // Filtrer les catégories selon le canal choisi (Boutique ou Librairie)
  const filteredCategories = allCategories.filter(c => c.channel === form.channel);

  const handleChannelChange = (val) => {
    const channelCats = allCategories.filter(c => c.channel === val);
    setForm({
      ...form,
      channel: val,
      category: channelCats.length > 0 ? channelCats[0].name : "",
      productType: val === "library" ? "digital" : "physical"
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
      if (!form.category) throw new Error("Veuillez créer une catégorie dans le dashboard d'abord");

      const imageUrl = await uploadImage();

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim(),
        channel: form.channel,
        productType: form.productType,
        category: [form.category], // On garde le format tableau pour votre modèle
        imageUrl
      };

      if (payload.price < 0) throw new Error("Le prix doit être positif");
      
      const result = await createProductAction(payload);

      if (result?.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        throw new Error("Erreur serveur lors de la création");
      }
    } catch (e2) {
      setErr(e2.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  if (fetchingCats) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-10">
        Nouveau <span className="text-orange-500">Produit</span>
      </h1>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50"
        onSubmit={onSubmit}
      >
        {/* COLONNE GAUCHE */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
              Désignation de l'article
            </label>
            <input
              required
              className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none border transition font-bold"
              placeholder="Ex: iPhone 15 Pro Max"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                Prix (FCFA)
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none border transition font-black italic"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                Unités en Stock
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none border transition pr-12 font-bold"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
              Description détaillée
            </label>
            <textarea
              required
              className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none border transition min-h-[180px] font-medium leading-relaxed"
              placeholder="Décrivez les caractéristiques du produit..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                Canal de vente
              </label>
              <select
                className="w-full border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 font-black text-xs outline-none cursor-pointer appearance-none border transition hover:border-orange-200"
                value={form.channel}
                onChange={(e) => handleChannelChange(e.target.value)}
              >
                <option value="shop">🛒 Boutique</option>
                <option value="library">📚 Librairie</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                Logistique
              </label>
              <select
                className="w-full border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 font-black text-xs outline-none cursor-pointer appearance-none border transition hover:border-orange-200"
                value={form.productType}
                onChange={(e) => setForm({ ...form, productType: e.target.value })}
              >
                <option value="physical">📦 Physique</option>
                <option value="digital">📂 Digital / PDF</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
              Catégorie (Rayon)
            </label>
            <select
              className="w-full border-2 border-orange-100 rounded-2xl px-5 py-4 bg-white font-bold text-sm outline-none cursor-pointer focus:border-orange-500 transition"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled value="">Aucune catégorie trouvée</option>
              )}
            </select>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
              Visuel Produit
            </label>
            <div className="relative group border-2 border-dashed border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center hover:border-orange-500 transition bg-gray-50/50">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-gray-500 text-center">
                {file ? file.name : "Glissez une image ou cliquez pour parcourir"}
              </span>
              <p className="text-[10px] text-gray-300 mt-2 uppercase font-black tracking-tighter">PNG, JPG jusqu'à 5MB</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="md:col-span-2 pt-6">
          {err && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-bold mb-6 border border-red-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> {err}
            </div>
          )}

          <button
            className="group relative w-full bg-gray-900 overflow-hidden text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-200 active:scale-95 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            <span className="relative z-10">
              {loading ? "Synchronisation..." : "Propulser l'article sur le store"}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </form>
    </div>
  );
}