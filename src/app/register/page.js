"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data.error || "Erreur inscription");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-green">Inscription</h1>
          <span className="text-xs px-2 py-1 rounded bg-brand-yellow text-black">
            my-ecommerce
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Crée ton compte pour commander, commenter, et ajouter aux favoris.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-orange"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Jean Dupont"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-orange"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ex: jean@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-orange"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="ex: +225 07 00 00 00 00"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-orange"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 caractères"
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-500">
              Astuce : utilise une combinaison lettres + chiffres.
            </p>
          </div>

          {err ? (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 text-sm">
              {err}
            </div>
          ) : null}

          <button
            className="w-full mt-2 px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:opacity-90 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-5 text-sm text-gray-700">
          Déjà un compte ?{" "}
          <Link className="underline text-brand-green" href="/login">
            Se connecter
          </Link>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        En créant un compte, tu acceptes les conditions d’utilisation (local).
      </div>
    </div>
  );
}