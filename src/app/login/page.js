"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErr("Email ou mot de passe incorrect.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 border rounded p-4">
      <h1 className="text-2xl font-bold text-brand-green">Connexion</h1>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: user@email.com"
          />
        </div>

        <div>
          <label className="block text-sm">Mot de passe</label>
          <input
            className="border rounded px-3 py-2 w-full"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
          />
        </div>

        {err ? <p className="text-red-600 text-sm">{err}</p> : null}

        <button
          className="px-4 py-2 rounded bg-brand-orange text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Pas de compte ?{" "}
        <Link className="underline text-brand-green" href="/register">
          Inscription
        </Link>
      </p>
    </div>
  );
}