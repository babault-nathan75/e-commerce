"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from "lucide-react";

// Configuration des catégories par canal
const CATEGORIES_MAP = {
  shop: ["Électronique", "Mode", "Maison", "Beauté", "Informatique"],
  library: ["Développement Personnel", "Business", "Scolaire", "Romans", "PDF"]
};

export default function EditProductPage({ params }) {
  const { id } = use(params); // ✅ Correction officielle Next.js
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    channel: "shop",
    category: "",
    productType: "physical",
    imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState("");

  // 1. Chargement initial du produit
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Produit introuvable");

        const p = data.product;
        setForm({
          name: p.name,
          price: String(p.price),
          description: p.description,
          channel: p.channel || "shop",
          // On récupère la première catégorie du tableau ou une par défaut
          category: p.category?.[0] || CATEGORIES_MAP[p.channel || "shop"][0],
          productType: p.productType || "physical",
          imageUrl: p.imageUrl
        });
        setPreview(p.imageUrl);
      } catch (e) {
        setErr(e.message);
      }
    }

    load();
  }, [id]);

  // Gestion du changement de canal (Boutique <-> Librairie)
  const handleChannelChange = (val) => {
    setForm({ 
      ...form, 
      channel: val, 
      category: CATEGORIES_MAP[val][0] // Reset la catégorie sur la 1ère du nouveau canal
    });
  };

  async function uploadImage() {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload échoué");
    return data.url;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadImage();

      const payload = {
        ...form,
        price: Number(form.price),
        category: [form.category], // On envoie toujours un tableau pour le modèle
        imageUrl
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Mise à jour échouée");
      router.push("/admin/products");
      router.refresh();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      router.push("/admin/products");
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Modifier l'article</h1>
        <button 
          onClick={onDelete}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4" /> Supprimer le produit
        </button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={onSubmit}>
        
        {/* COLONNE GAUCHE : INFOS GÉNÉRALES */}
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Nom du produit</label>
            <input
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Prix (FCFA)</label>
            <input
              required
              type="number"
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition font-mono font-bold"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Description</label>
            <textarea
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-green outline-none border transition min-h-[160px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* COLONNE DROITE : CLASSIFICATION & IMAGE */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Canal</label>
                <select
                  className="w-full border-gray-200 rounded-xl px-3 py-3 bg-gray-50 font-bold text-sm"
                  value={form.channel}
                  onChange={(e) => handleChannelChange(e.target.value)}
                >
                  <option value="shop">🛒 Boutique</option>
                  <option value="library">📚 Librairie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Type</label>
                <select
                  className="w-full border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-sm"
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                >
                  <option value="physical">Physique</option>
                  <option value="digital">Digital / PDF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Catégorie</label>
              <select
                className="w-full border-2 border-brand-green/20 rounded-xl px-4 py-3 bg-white font-medium"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES_MAP[form.channel]?.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GESTION IMAGE */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Image du produit</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                <img src={preview || null} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1">
                <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-brand-green transition bg-gray-50 cursor-pointer">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if(f) {
                        setFile(f);
                        setPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                  <ImageIcon className="w-6 h-6 text-gray-300 mb-1 group-hover:text-brand-green" />
                  <span className="text-[10px] text-gray-500 font-bold text-center leading-tight">CLIQUER POUR<br/>REMPLACER</span>
                </div>
              </div>
            </div>
          </div>

          {err && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">{err}</div>}

          <button
            className="w-full bg-brand-green hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            <Save className="w-6 h-6" />
            {loading ? "SAUVEGARDE..." : "METTRE À JOUR"}
          </button>
        </div>
      </form>
    </div>
  );
}