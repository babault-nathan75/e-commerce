"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // CORRECTION : Vérification des mots de passe au lieu des emails
    if (form.password !== form.passwordConfirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.password.length < 6) {
      setErr("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data.error || "Erreur inscription");
        return;
      }

      router.push("/login?registered=1");
      router.refresh();
    } catch (e2) {
      setErr("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-yellow-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-green-500 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-green-600">
              Créer un compte
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Rejoins <span className="font-semibold text-orange-500">my-ecommerce</span> et
              profite d’une expérience d’achat premium.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* NOM */}
            <div>
              <label className="text-sm font-medium text-gray-700">Nom complet</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">Adresse email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jean@email.com"
                  required
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-gray-700">Téléphone</label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+225 07 00 00 00 00"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* PASSWORD CONFIRMATION */}
            <div>
              <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"} // CORRECTION : Utilise aussi showPassword ici
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:outline-none ${
                    form.passwordConfirm && form.password !== form.passwordConfirm
                      ? "border-red-400 focus:ring-red-400"
                      : "focus:ring-orange-400"
                  }`}
                  value={form.passwordConfirm}
                  onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                  placeholder="Confirme ton mot de passe"
                  required
                />
              </div>
            </div>

            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-pulse">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold hover:opacity-90 disabled:opacity-60 transition shadow-lg"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-semibold text-green-600 hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}