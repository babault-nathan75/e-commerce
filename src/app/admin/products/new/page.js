"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    channel: "shop"
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function uploadImage() {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd
    });

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
        name: form.name,
        price: Number(form.price),
        imageUrl,
        description: form.description,
        channel: form.channel,
        productType: "physical"
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Création échouée");

      router.push("/admin/products");
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Nouveau produit</h1>

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
            placeholder="ex: 5000"
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
          <label className="block text-sm">Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {err ? <p className="text-red-600">{err}</p> : null}

        <button
          className="px-4 py-2 rounded bg-brand-orange text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
}