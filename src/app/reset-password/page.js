"use client";

import { useState, useEffect, Suspense } from "react"; // Modif : Ajout de Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

// Composant Input extrait pour clarté
const PasswordInput = ({ label, value, onChange, showPw, toggleShowPw }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
      </div>
      <input
        required
        type={showPw ? "text" : "password"}
        className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-gray-400"
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={toggleShowPw}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
      >
        {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
);

// Modif : On encapsule ton code dans un composant de contenu
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pw, setPw] = useState({ new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");

  // Vérification du token au chargement
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMsg("Lien invalide ou expiré.");
    }
  }, [token]);

  async function onSubmit(e) {
    e.preventDefault();
    if (pw.new !== pw.confirm) {
      setStatus("error");
      setMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw.new }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");

      setStatus("success");
      setTimeout(() => router.push("/login"), 3000); 
    } catch (error) {
      setStatus("error");
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800 relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-2xl mb-4 shadow-sm">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Nouveau mot de passe</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Sécurisez votre compte avec un mot de passe fort.</p>
        </div>

        {status === "success" ? (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">C'est tout bon !</h3>
            <p className="text-gray-500 mt-2">Votre mot de passe a été mis à jour.</p>
            <p className="text-xs text-gray-400 mt-6">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <PasswordInput 
              label="Nouveau mot de passe" 
              value={pw.new} 
              onChange={(v) => setPw({ ...pw, new: v })} 
              showPw={showPw}
              toggleShowPw={() => setShowPw(!showPw)}
            />
            <PasswordInput 
              label="Confirmer" 
              value={pw.confirm} 
              onChange={(v) => setPw({ ...pw, confirm: v })} 
              showPw={showPw}
              toggleShowPw={() => setShowPw(!showPw)}
            />

            {status === "error" && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400">
                <AlertTriangle size={18} /> {msg}
              </div>
            )}

            <button
              disabled={loading || !token}
              className="w-full py-4 rounded-xl bg-orange-600 text-white font-black text-lg uppercase tracking-widest hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Réinitialiser"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Modif : Export par défaut avec Suspense indispensable pour le build Next.js
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}