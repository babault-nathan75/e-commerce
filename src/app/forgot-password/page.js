"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // Appel API (à créer côté backend)
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      setStatus("success");
      setMsg("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800 relative z-10">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 text-center animate-in zoom-in duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-green-800 dark:text-green-300 font-bold mb-2">Email envoyé !</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mb-6">{msg}</p>
            <button 
              onClick={() => { setEmail(""); setStatus(null); }}
              className="text-xs font-bold uppercase tracking-wider text-green-600 hover:text-green-800 underline"
            >
              Renvoyer un email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                Email associé au compte
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white font-medium focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder-gray-400"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {status === "error" && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400">
                <AlertTriangle size={18} /> {msg}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg uppercase tracking-widest hover:bg-green-600 hover:text-white dark:hover:bg-green-400 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}