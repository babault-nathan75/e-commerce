"use client";

import { useEffect, useState, useMemo } from "react";
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
  Search,
  UserCheck,
  MoreVertical
} from "lucide-react";

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur de synchronisation");
      setUsers(data.users || []);
    } catch (e) {
      setErr(e.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // FILTRE DE RECHERCHE (PERFECTION UX)
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  async function removeUser(userId, email, isAdmin) {
    if (isAdmin) {
      setErr("SÉCURITÉ : La suppression d'un compte administrateur est bloquée.");
      return;
    }
    if (!confirm(`🚨 Supprimer définitivement ${email} ?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Échec de la suppression");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* HEADER DE CONTRÔLE */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <Link href="/admin" className="p-3 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all">
                  <ArrowLeft size={20} />
               </Link>
               <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Registry <span className="text-green-600">Users</span></h1>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base de données clients : {users.length}</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Chercher un nom, email..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 w-full md:w-64 transition-all"
                  />
               </div>
               <button onClick={load} className="p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all active:scale-90">
                  <RefreshCw className={`${loading ? 'animate-spin' : ''} text-gray-600`} size={20} />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* MESSAGE D'ERREUR SÉCURISÉ */}
        {err && (
          <div className="mb-8 p-4 bg-gray-900 text-white rounded-2xl flex items-center justify-between border-l-8 border-red-500 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest">{err}</span>
            </div>
            <button onClick={() => setErr("")} className="opacity-50 hover:opacity-100 uppercase text-[10px] font-bold">Fermer</button>
          </div>
        )}

        {/* GRILLE DES UTILISATEURS */}
        <div className="grid gap-6">
          {filteredUsers.map((u) => (
            <div 
              key={u._id} 
              className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${u.isAdmin ? 'border-green-100 shadow-green-100/20' : 'border-transparent shadow-gray-200/40'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* BLOC IDENTITÉ */}
                <div className="flex items-center gap-5 flex-1">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${u.isAdmin ? 'bg-gradient-to-br from-green-500 to-green-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                       <h3 className="text-xl font-black text-gray-900 leading-tight">{u.name}</h3>
                       {u.isAdmin && (
                         <span className="bg-green-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-green-600/20">
                            <ShieldCheck size={10} /> Admin
                         </span>
                       )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Mail size={14} className="text-orange-500" /> {u.email}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Phone size={14} className="text-blue-500" /> {u.phone || "---"}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <Calendar size={14} /> Membre depuis {new Date(u.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                       </div>
                    </div>
                  </div>
                </div>

                {/* BLOC LOCALISATION & ACTIONS */}
                <div className="flex flex-col md:flex-row items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 uppercase">
                     <MapPin size={12} className="text-gray-400" /> {u.address || "Abidjan, CI"}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      disabled={u.isAdmin}
                      onClick={() => removeUser(u._id, u.email, u.isAdmin)}
                      className={`p-3 rounded-2xl transition-all shadow-sm ${u.isAdmin ? 'bg-gray-100 text-gray-300' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-200'}`}
                    >
                      <Trash2 size={20} />
                    </button>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                       <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-32 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-100">
               <Users size={40} className="text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase italic">Aucun profil trouvé</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2 text-sm font-medium">Réessayez avec un autre nom ou vérifiez l'orthographe.</p>
          </div>
        )}
      </div>
    </div>
  );
}