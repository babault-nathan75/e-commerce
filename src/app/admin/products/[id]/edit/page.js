"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Box, AlertCircle, Loader2 } from "lucide-react";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  // --- ÉTATS ---
  const [allCategories, setAllCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    channel: "shop",
    category: "",
    productType: "physical",
    imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState("");

  // --- CHARGEMENT INITIAL (PRODUIT + CATÉGORIES) ---
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        // On récupère les deux sources de données en parallèle
        const [resProd, resCats] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/admin/categories")
        ]);

        const dataProd = await resProd.json();
        const dataCats = await resCats.json();

        if (!resProd.ok) throw new Error(dataProd.error || "Produit introuvable");
        
        setAllCategories(dataCats);

        const p = dataProd.product;
        setForm({
          name: p.name,
          price: String(p.price),
          stock: String(p.stockAvailable || 0), // Mapping correct du champ stockAvailable
          description: p.description,
          channel: p.channel || "shop",
          category: p.category?.[0] || "",
          productType: p.productType || "physical",
          imageUrl: p.imageUrl
        });
        setPreview(p.imageUrl);
      } catch (e) {
        setErr(e.message);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

  // --- LOGIQUE DYNAMIQUE DES CATÉGORIES ---
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

  // --- ACTIONS ---
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
        stockAvailable: Number(form.stock), // On renvoie vers le champ stockAvailable du modèle
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

  async function onDelete() {
    if (!confirm("🚨 Voulez-vous vraiment supprimer définitivement ce produit ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression échouée");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  const getStockStatus = () => {
    const s = Number(form.stock);
    if (s <= 0) return { label: "Rupture de stock", color: "text-red-600 bg-red-50 border-red-100" };
    if (s <= 5) return { label: "Stock critique (Flamme active)", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return null;
  };

  const status = getStockStatus();

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition">
          <ArrowLeft size={16} /> Retour à l'inventaire
        </button>

        <button 
          type="button"
          onClick={onDelete}
          disabled={loading}
          className="flex items-center gap-2 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl transition disabled:opacity-50"
        >
          <Trash2 size={16} /> Supprimer définitivement
        </button>
      </div>

      <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-10">
        Modifier <span className="text-emerald-500">l'article</span>
      </h1>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={onSubmit}>
        
        {/* COLONNE GAUCHE */}
        <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nom de l'article</label>
            <input
              required
              className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none border transition font-bold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Prix (FCFA)</label>
              <input
                required
                type="number"
                className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none border transition font-black italic"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Unités en Stock</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  className={`w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none border transition font-bold pr-12 ${Number(form.stock) <= 5 ? 'border-orange-300 bg-orange-50/30 text-orange-700' : ''}`}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <Box className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              </div>
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest animate-pulse ${status.color}`}>
              <AlertCircle size={16} />
              {status.label}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Description</label>
            <textarea
              required
              className="w-full border-gray-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none border transition min-h-[200px] leading-relaxed"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Canal</label>
                <select
                  className="w-full border-gray-200 rounded-2xl px-4 py-4 bg-gray-50 font-black text-xs outline-none cursor-pointer appearance-none hover:border-emerald-200 transition"
                  value={form.channel}
                  onChange={(e) => handleChannelChange(e.target.value)}
                >
                  <option value="shop">🛒 Boutique</option>
                  <option value="library">📚 Librairie</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Logistique</label>
                <select
                  className="w-full border-gray-200 rounded-2xl px-4 py-4 bg-gray-50 font-black text-xs outline-none cursor-pointer appearance-none hover:border-emerald-200 transition"
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                >
                  <option value="physical">📦 Physique</option>
                  <option value="digital">📂 Digital / PDF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Rayon (Catégorie)</label>
              <select
                className="w-full border-2 border-emerald-100 rounded-2xl px-5 py-4 bg-white font-bold text-sm outline-none cursor-pointer focus:border-emerald-500 transition shadow-inner"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <option disabled value="">Aucun rayon configuré</option>
                )}
              </select>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">Aperçu du visuel</label>
            <div className="flex flex-col items-center gap-8">
              <div className="w-48 h-48 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 overflow-hidden flex items-center justify-center p-4 relative group">
                <img src={preview || "/placeholder.png"} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              </div>
              
              <div className="w-full">
                <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-emerald-500 transition bg-gray-50/50 cursor-pointer">
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
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Remplacer l'image</span>
                </div>
              </div>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2 italic">
              <AlertCircle size={14} /> {err}
            </div>
          )}

          <button
            className="w-full bg-gray-900 hover:bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            disabled={loading}
            type="submit"
          >
            <Save className="w-5 h-5" />
            {loading ? "Synchronisation..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}