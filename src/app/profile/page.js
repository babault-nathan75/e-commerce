"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  User, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Loader2, 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  Camera,
  AlertTriangle,
  KeyRound,
  BadgeCheck
} from "lucide-react";

// ✅ CORRECTION : Le composant est défini ICI (à l'extérieur), une seule fois.
const InputGroup = ({ icon: Icon, label, className, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
      </div>
      <input 
        {...props}
        className={`
          w-full pl-12 pr-4 py-3.5 
          bg-gray-50 dark:bg-gray-800/50 
          border border-gray-200 dark:border-gray-700 
          rounded-xl outline-none 
          text-gray-900 dark:text-white font-medium
          focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 
          transition-all duration-300
          ${className || ""}
        `}
      />
    </div>
  </div>
);

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
      setMsg("Profil mis à jour avec succès");
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
      setPwMsg("Mot de passe sécurisé et mis à jour.");
      setTimeout(() => setPwMsg(""), 3000);
    }
  }

  if (status === "loading") return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
        
        {/* --- HEADER BACKGROUND DECORATION --- */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-orange-500/10 to-transparent dark:from-orange-900/20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          
          {/* --- NAVIGATION --- */}
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors group"
          >
            <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group-hover:-translate-x-1 transition-transform">
              <ChevronLeft size={16} />
            </div>
            Retour
          </button>

          {/* --- HERO SECTION --- */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-black text-white flex items-center justify-center text-4xl md:text-5xl font-black shadow-2xl shadow-orange-500/20 ring-4 ring-white dark:ring-gray-950">
                {form.name ? form.name[0].toUpperCase() : <User size={48} />}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl border-4 border-white dark:border-gray-950 shadow-sm">
                <Camera size={16} />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {form.name || "Utilisateur"}
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} /> Admin
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} /> {form.email}
              </p>
            </div>
          </div>

          {/* --- GRID LAYOUT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* === GAUCHE : FORMULAIRE PROFIL (2/3) === */}
            <div className="lg:col-span-2">
              <form onSubmit={save} className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                
                {/* Header Card */}
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informations Personnelles</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gérez vos coordonnées de livraison et de contact.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup 
                      icon={User} 
                      label="Nom Complet" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    />
                    <InputGroup 
                      icon={Mail} 
                      label="Adresse Email" 
                      type="email"
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    />
                  </div>

                  <InputGroup 
                    icon={Phone} 
                    label="Téléphone" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  />

                  {!isAdmin && (
                     <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                          Adresse de livraison
                        </label>
                        <div className="relative group">
                          <div className="absolute top-4 left-4 pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <textarea 
                            className="
                              w-full pl-12 pr-4 py-3.5 
                              bg-gray-50 dark:bg-gray-800/50 
                              border border-gray-200 dark:border-gray-700 
                              rounded-xl outline-none 
                              text-gray-900 dark:text-white font-medium
                              focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 
                              min-h-[120px] resize-none transition-all
                            "
                            value={form.address} 
                            onChange={(e) => setForm({ ...form, address: e.target.value })} 
                          />
                        </div>
                     </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="mt-8 space-y-4">
                  {msg && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30 animate-in slide-in-from-bottom-2">
                      <BadgeCheck size={20} />
                      <p className="text-sm font-bold">{msg}</p>
                    </div>
                  )}
                  {err && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 animate-in slide-in-from-bottom-2">
                      <AlertTriangle size={20} />
                      <p className="text-sm font-bold">{err}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    type="submit"
                    disabled={loading} 
                    className="
                      flex items-center justify-center gap-2
                      w-full md:w-auto px-8 py-4 
                      bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                      text-sm font-black uppercase tracking-widest rounded-xl 
                      hover:bg-orange-600 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900
                      transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {loading ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>

            {/* === DROITE : SÉCURITÉ (1/3) === */}
            <div className="lg:col-span-1">
              <form onSubmit={changePassword} className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-800 h-full">
                
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sécurité</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mettre à jour le mot de passe.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <InputGroup 
                    icon={KeyRound} 
                    label="Actuel" 
                    type="password" 
                    placeholder="••••••••"
                    value={pw.oldPassword} 
                    onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} 
                  />
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                  <InputGroup 
                    icon={Lock} 
                    label="Nouveau" 
                    type="password" 
                    placeholder="••••••••"
                    value={pw.newPassword} 
                    onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} 
                  />
                  <InputGroup 
                    icon={CheckCircle2} 
                    label="Confirmer" 
                    type="password" 
                    placeholder="••••••••"
                    value={pw.confirmPassword} 
                    onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} 
                    className={`
                      ${pw.confirmPassword && pw.newPassword === pw.confirmPassword && pw.newPassword.length > 0
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' 
                        : ''}
                    `}
                  />
                </div>

                {/* Password Notifications */}
                <div className="mt-6 space-y-3">
                  {pwErr && <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex gap-2"><AlertTriangle size={14}/> {pwErr}</p>}
                  {pwMsg && <p className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex gap-2"><CheckCircle2 size={14}/> {pwMsg}</p>}
                </div>

                <div className="mt-8">
                  <button type="submit" className="w-full py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                    Changer le mot de passe
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}