"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      setMsg("");
      const res = await fetch("/api/profile", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Erreur profil");
        return;
      }
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        address: data.user.address || ""
      });
      setEmail(data.user.email || "");
    }
    if (session?.user) load();
  }, [session]);

  async function save(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        address: form.address
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Sauvegarde impossible");
      return;
    }
    setMsg("Profil mis à jour.");
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");

    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pw)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwErr(data.error || "Changement mot de passe impossible");
      return;
    }
    setPw({ oldPassword: "", newPassword: "" });
    setPwMsg("Mot de passe changé.");
  }

  if (status === "loading") return <div>Chargement...</div>;

  if (!session?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Mon profil</h1>
        <p className="mt-3">Connexion requise.</p>
        <Link className="underline text-brand-orange" href="/login">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Mon profil</h1>
        <p className="text-sm text-gray-600 mt-1">Email: <strong>{email}</strong></p>
      </div>

      <form onSubmit={save} className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Informations</h2>

        <div>
          <label className="block text-sm">Nom</label>
          <input className="border rounded px-3 py-2 w-full" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Téléphone</label>
          <input className="border rounded px-3 py-2 w-full" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Adresse</label>
          <textarea className="border rounded px-3 py-2 w-full min-h-24" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        {err ? <p className="text-red-600">{err}</p> : null}
        {msg ? <p className="text-green-700">{msg}</p> : null}

        <button className="px-4 py-2 rounded bg-brand-green text-white" type="submit">
          Sauvegarder
        </button>
      </form>

      <form onSubmit={changePassword} className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Mot de passe</h2>

        <div>
          <label className="block text-sm">Ancien mot de passe</label>
          <input type="password" className="border rounded px-3 py-2 w-full" value={pw.oldPassword}
            onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm">Nouveau mot de passe</label>
          <input type="password" className="border rounded px-3 py-2 w-full" value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        </div>

        {pwErr ? <p className="text-red-600">{pwErr}</p> : null}
        {pwMsg ? <p className="text-green-700">{pwMsg}</p> : null}

        <button className="px-4 py-2 rounded bg-brand-orange text-white" type="submit">
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}