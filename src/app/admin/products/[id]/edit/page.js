"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Box, AlertCircle } from "lucide-react";

const CATEGORIES_MAP = {
  shop: ["Électronique", "Mode", "Maison", "Beauté", "Informatique"],
  library: ["Développement Personnel", "Business", "Scolaire", "Romans", "PDF"]
};

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "", // ✅ Ajouté
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
          stock: String(p.stock || 0), // ✅ Récupéré (défaut à 0 si inexistant)
          description: p.description,
          channel: p.channel || "shop",
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

  const handleChannelChange = (val) => {
    setForm({ 
      ...form, 
      channel: val, 
      category: CATEGORIES_MAP[val][0]
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
        stock: Number(form.stock), // ✅ Converti en nombre
        category: [form.category],
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

  // Helper pour l'alerte visuelle du stock
  const getStockStatus = () => {
    const s = Number(form.stock);
    if (s <= 0) return { label: "Rupture de stock", color: "text-red-600 bg-red-50 border-red-100" };
    if (s <= 5) return { label: "Stock critique (Flamme active)", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return null;
  };

  const status = getStockStatus();
  async function onDelete() {
  if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

  setLoading(true);
  setErr("");

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Suppression échouée");
    }

    // Retour à la liste après suppression
    router.push("/admin/products");
    router.refresh();
  } catch (e) {
    setErr(e.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

      <button 
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl transition disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" /> Supprimer le produit
      </button>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={onSubmit}>
        
        {/* COLONNE GAUCHE */}
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Nom du produit</label>
            <input
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none border transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Prix (FCFA)</label>
              <input
                required
                type="number"
                className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none border transition font-mono font-bold"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            {/* ✅ CHAMP STOCK AJOUTÉ ICI */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Quantité en Stock</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  className={`w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none border transition font-mono font-bold ${Number(form.stock) <= 5 ? 'border-orange-300' : ''}`}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <Box className="absolute right-3 top-3 w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Alertes de stock dynamiques */}
          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-black uppercase tracking-wider ${status.color}`}>
              <AlertCircle size={14} />
              {status.label}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Description</label>
            <textarea
              required
              className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none border transition min-h-[160px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* COLONNE DROITE */}
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
                className="w-full border-2 border-emerald-500/10 rounded-xl px-4 py-3 bg-white font-medium"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES_MAP[form.channel]?.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Image du produit</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                <img src={preview || "/placeholder.png"} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1">
                <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-emerald-500 transition bg-gray-50 cursor-pointer">
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
                  <ImageIcon className="w-6 h-6 text-gray-300 mb-1 group-hover:text-emerald-500" />
                  <span className="text-[10px] text-gray-500 font-bold text-center leading-tight">CHANGER IMAGE</span>
                </div>
              </div>
            </div>
          </div>

          {err && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">{err}</div>}

          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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