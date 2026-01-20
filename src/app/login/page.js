"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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
        redirect: false,
      });

      if (res?.error) {
        setErr("Email ou mot de passe incorrect.");
        setLoading(false); // Important de stopper le loading ici
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setErr("Une erreur technique est survenue.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden p-4">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] translate-y-1/3 pointer-events-none" />

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-white/50 dark:border-gray-800 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4 group">
            <span className="text-3xl font-black tracking-tight text-green-500 dark:text-white">
              Hebron <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Ivoire</span>
            </span>
          </Link>
          <h1 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Bon retour parmi nous !
          </h1>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                required
                type="email"
                className="
                  w-full pl-12 pr-4 py-4 
                  bg-gray-50 dark:bg-gray-800/50 
                  border border-gray-200 dark:border-gray-700 
                  rounded-xl outline-none 
                  text-gray-900 dark:text-white font-medium
                  focus:border-green-500 focus:ring-4 focus:ring-green-500/10 
                  transition-all duration-300 placeholder-gray-400
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                className="
                  w-full pl-12 pr-12 py-4 
                  bg-gray-50 dark:bg-gray-800/50 
                  border border-gray-200 dark:border-gray-700 
                  rounded-xl outline-none 
                  text-gray-900 dark:text-white font-medium
                  focus:border-green-500 focus:ring-4 focus:ring-green-500/10 
                  transition-all duration-300 placeholder-gray-400
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{err}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="
              w-full py-4 rounded-xl 
              bg-green-600 text-white font-bold text-lg uppercase tracking-widest
              hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5
              active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-300 flex items-center justify-center gap-2
            "
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Connexion...
              </>
            ) : (
              <>
                Se connecter <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nouveau chez Hebron Ivoire ?{" "}
            <Link 
              href="/register" 
              className="font-bold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1 group"
            >
              Créer un compte 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}