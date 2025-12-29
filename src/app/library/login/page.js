"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (res?.error) return setErr("Identifiants invalides");
    router.push("/");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Connexion</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button type="submit">Se connecter</button>
      </form>
      {err ? <p style={{ color: "red" }}>{err}</p> : null}
    </div>
  );
}