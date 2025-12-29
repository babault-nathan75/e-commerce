"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }) {
  const router = useRouter();
  const id = params.id;

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    channel: "shop",
    imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Produit introuvable");
        return;
      }
      const p = data.product;
      setForm({
        name: p.name,
        price: String(p.price),
        description: p.description,
        channel: p.channel,
        imageUrl: p.imageUrl
      });
    }
    load();
  }, [id]);

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
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadImage();

      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        channel: form.channel,
        imageUrl
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update échoué");

      router.push("/admin/products");
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Supprimer ce produit ?")) return;
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Suppression échouée");
      router.push("/admin/products");
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Modifier produit</h1>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm">Nom</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm">Prix</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm">Canal</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          >
            <option value="shop">Boutique</option>
            <option value="library">Librairie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Description</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-28"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm">Image actuelle</label>
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="image" className="w-40 h-40 object-cover rounded border" />
          ) : null}
        </div>

        <div>
          <label className="block text-sm">Changer l’image (optionnel)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {err ? <p className="text-red-600">{err}</p> : null}

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded bg-brand-green text-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60"
            disabled={loading}
            type="button"
            onClick={onDelete}
          >
            Supprimer
          </button>
        </div>
      </form>
    </div>
  );
}