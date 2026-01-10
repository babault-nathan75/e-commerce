"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Mail,
  Calendar,
  X
} from "lucide-react";

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

  async function toggleAdmin(userId, nextIsAdmin) {
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: nextIsAdmin })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Impossible de changer le rôle");

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isAdmin: data.user.isAdmin } : u))
      );
    } catch (e) {
      setErr(e.message || "Erreur");
    }
  }

  async function removeUser(userId, email, isAdmin) {
    setErr("");

    // --- SÉCURITÉ : Empêcher la suppression d'un admin ---
    if (isAdmin) {
      setErr("Action interdite : Vous ne pouvez pas supprimer un compte administrateur.");
      return;
    }

    if (!confirm(`🚨 ATTENTION : Supprimer définitivement l'utilisateur ${email} ?`)) return;

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* NAVIGATION & RETOUR */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-green transition-all group"
        >
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-brand-green/10">
            <ArrowLeft className="w-4 h-4" />
          </div>
          RETOUR AU DASHBOARD
        </Link>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {/* TITRE DE LA PAGE */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">
          Gestion des <span className="text-brand-green">Utilisateurs</span>
        </h1>
        <p className="text-gray-500 text-sm italic">Contrôlez les accès et les comptes clients.</p>
      </div>

      {/* ALERTE ERREUR */}
      {err && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center justify-between rounded-r-xl shadow-sm">
          <div className="flex items-center gap-3 font-bold uppercase tracking-tight">
            <ShieldAlert className="w-5 h-5" />
            {err}
          </div>
          <button onClick={() => setErr("")}>
            <X className="w-5 h-5 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* LISTE DES UTILISATEURS */}
      <div className="grid gap-4">
        {users.map((u) => (
          <div 
            key={u._id} 
            className={`group bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${u.isAdmin ? 'border-brand-green/30' : 'border-gray-100'}`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* INFOS UTILISATEUR */}
              <div className="flex-1 flex items-start gap-4">
                <div className={`p-3 rounded-full ${u.isAdmin ? "bg-brand-green/10 text-brand-green" : "bg-gray-100 text-gray-400"}`}>
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{u.name}</h3>
                    {u.isAdmin && (
                      <span className="bg-brand-green text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {u.email}</span>
                    <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {u.phone || "Non renseigné"}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {u.address || "Aucune adresse"}</span>
                    <span className="flex items-center gap-2 font-medium text-gray-400">
                      <Calendar className="w-3.5 h-3.5" /> 
                      Inscrit le {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0">
                
                {/* Toggle Admin */}
                {/* <button
                  type="button"
                  onClick={() => toggleAdmin(u._id, !u.isAdmin)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
                    u.isAdmin 
                    ? "bg-gray-50 text-gray-400 border-gray-200" 
                    : "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                  }`}
                >
                  {u.isAdmin ? "Révoquer Admin" : "Promouvoir Admin"}
                </button> */}

                {/* Supprimer */}
                <button
                  type="button"
                  disabled={u.isAdmin} // Désactivé si Admin
                  onClick={() => removeUser(u._id, u.email, u.isAdmin)}
                  className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-95 ${
                    u.isAdmin 
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-100" 
                    : "bg-red-50 text-red-500 hover:bg-red-600 hover:text-white"
                  }`}
                  title={u.isAdmin ? "Impossible de supprimer un admin" : "Supprimer l'utilisateur"}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        ))}

        {users.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun utilisateur enregistré.</p>
          </div>
        )}
      </div>
    </div>
  );
}