"use client";

import { useEffect, useState } from "react";

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur chargement users");
      setUsers(data.users || []);
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // async function toggleAdmin(userId, nextIsAdmin) {
  //   setErr("");
  //   try {
  //     const res = await fetch(`/api/admin/users/${userId}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ isAdmin: nextIsAdmin })
  //     });
  //     const data = await res.json().catch(() => ({}));
  //     if (!res.ok) throw new Error(data.error || "Impossible de changer le rôle");

  //     setUsers((prev) =>
  //       prev.map((u) => (u._id === userId ? { ...u, isAdmin: data.user.isAdmin } : u))
  //     );
  //   } catch (e) {
  //     setErr(e.message || "Erreur");
  //   }
  // }

  async function removeUser(userId, email) {
    setErr("");
    if (!confirm(`Supprimer l'utilisateur ${email} ?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Suppression impossible");

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (e) {
      setErr(e.message || "Erreur");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 rounded border hover:border-brand-orange"
          onClick={load}
          type="button"
          disabled={loading}
        >
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {err ? <p className="text-red-600 mt-3">{err}</p> : null}

      <div className="mt-4 space-y-3">
        {users.map((u) => (
          <div key={u._id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-sm text-gray-700">{u.email}</div>
                <div className="text-sm text-gray-600">
                  {u.phone ? `Tel: ${u.phone}` : "Tel: -"} •{" "}
                  {u.address ? `Adresse: ${u.address}` : "Adresse: -"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Créé: {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    u.isAdmin ? "bg-brand-green text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {u.isAdmin ? "ADMIN" : "USER"}
                </span>

                {/* <button
                  type="button"
                  className="px-3 py-2 rounded border hover:border-brand-green"
                  onClick={() => toggleAdmin(u._id, !u.isAdmin)}
                >
                  {u.isAdmin ? "Retirer Admin" : "Mettre Admin"}
                </button> */}

                <button
                  type="button"
                  className="px-3 py-2 rounded bg-red-600 text-white hover:opacity-90"
                  onClick={() => removeUser(u._id, u.email)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && !loading ? (
          <p className="text-gray-600">Aucun utilisateur.</p>
        ) : null}
      </div>
    </div>
  );
}