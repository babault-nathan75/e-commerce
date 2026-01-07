"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  User, Lock, MapPin, Phone, Mail, Save, 
  Loader2, ShieldCheck, ChevronLeft, CheckCircle2 
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || ""
        });
        setIsAdmin(data.user.isAdmin || false);
      }
    }
    if (session?.user) load();
  }, [session]);

  async function save(e) {
    e.preventDefault();
    setLoading(true); setErr(""); setMsg("");

    // On prépare les données à envoyer
    // Si c'est un admin, on retire le champ adresse pour éviter les erreurs de validation
    const dataToSend = { ...form };
    if (isAdmin) {
      delete dataToSend.address;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Erreur de sauvegarde");
    } else {
      setMsg("Vos données ont été mise à jour");
      setTimeout(() => setMsg(""), 3000);
      if (form.email !== session?.user?.email) await update();
    }
    setLoading(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pw.newPassword !== pw.confirmPassword) {
      setPwErr("Les mots de passe ne correspondent pas.");
      return;
    }
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: pw.oldPassword, newPassword: pw.newPassword })
    });
    if (!res.ok) setPwErr("Ancien mot de passe incorrect.");
    else {
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwMsg("Mot de passe mis à jour.");
      setTimeout(() => setPwMsg(""), 3000);
    }
  }

  if (status === "loading") return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-orange-600 transition-colors text-xs font-bold uppercase group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
          {form.name ? form.name[0].toUpperCase() : "U"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 leading-none">Mon Profil</h1>
            {isAdmin && <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Admin</span>}
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-widest">{form.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          <form onSubmit={save} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <User className="w-4 h-4 text-orange-600" />
              <h2 className="font-black text-gray-800 text-xs uppercase italic">Informations</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nom complet</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email</label>
                <input type="email" className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Téléphone</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              {!isAdmin && (
                <div className="animate-in fade-in duration-500">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600" /> Adresse de livraison
                  </label>
                  <textarea 
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none min-h-[100px]" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  />
                </div>
              )}
            </div>

            {msg && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-[11px] font-black uppercase">{msg}</p>
              </div>
            )}
            {err && <p className="text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl">{err}</p>}

            <button disabled={loading} className="w-full py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {loading ? "Mise à jour..." : "Sauvegarder les modifications"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={changePassword} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Lock className="w-4 h-4 text-orange-600" />
              <h2 className="font-black text-gray-800 text-xs uppercase italic">Sécurité</h2>
            </div>
            <div className="space-y-4">
              <input type="password" placeholder="Ancien mot de passe" className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} />
              <input type="password" placeholder="Nouveau mot de passe" className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              <input type="password" placeholder="Confirmer le nouveau" className={`w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none transition-all ${pw.confirmPassword && pw.newPassword === pw.confirmPassword ? 'border-green-500 ring-2 ring-green-50' : 'focus:border-orange-500'}`} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
            </div>
            {pwErr && <p className="text-[10px] font-bold text-red-500">{pwErr}</p>}
            {pwMsg && <p className="text-[10px] font-bold text-green-600">{pwMsg}</p>}
            <button className="w-full py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all">
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}