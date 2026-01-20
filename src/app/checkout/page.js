"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCartStore } from "@/store/cart";
import { 
  ShoppingCart, 
  User, 
  Home, 
  LogIn, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  Lock,
  CreditCard,
  ChevronRight
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.price, 0),
    [items]
  );

  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [guest, setGuest] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: ""
  });

  const isLoggedIn = !!session?.user;

  async function createOrder(payload) {
    const res = await fetch("/api/orders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Commande échouée");
    return data;
  }

  // --- LOGIQUE DE SOUMISSION (Identique, juste refactorisée pour propreté) ---
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErr("Veuillez accepter les conditions générales de vente.");
      return;
    }
    setErr("");
    setLoading(true);

    try {
      let payload = {};
      
      const commonItems = items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
      }));

      if (type === 'guest') {
         if (!guest.name || !guest.email || !guest.phone || !guest.deliveryAddress) {
            throw new Error("Tous les champs sont obligatoires.");
         }
         payload = {
            items: commonItems,
            deliveryAddress: guest.deliveryAddress,
            contactPhone: guest.phone,
            guest
         };
      } else {
         payload = {
            items: commonItems,
            deliveryAddress: "Adresse enregistrée",
            contactPhone: session.user.phone || "Non renseigné"
         };
      }

      const data = await createOrder(payload);
      clear();
      router.push(`/order/success?code=${data.orderCode}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- COMPOSANT CHECKBOX CGV STYLISÉ ---
  const TermsCheckbox = () => (
    <div className="group flex items-start gap-3 my-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-600">
      <div className="relative flex items-center h-5 mt-0.5">
        <input 
          type="checkbox" 
          id="terms" 
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-colors checked:border-green-600 checked:bg-green-600 focus:ring-green-600"
        />
        <CheckCircle2 className="pointer-events-none absolute left-0 h-5 w-5 text-white opacity-0 peer-checked:opacity-100" size={16} strokeWidth={3} />
      </div>
      <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 leading-tight cursor-pointer select-none">
        Je confirme avoir lu et accepté les{" "}
        <Link href="/terms" target="_blank" className="text-green-600 dark:text-green-400 underline font-bold hover:text-green-700">
          Conditions Générales de Vente
        </Link>
        .
      </label>
    </div>
  );

  // --- LOADER GLOBAL ---
  if (status === "loading") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      <p className="mt-4 text-gray-500 font-medium animate-pulse">Chargement...</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          
          {/* === COLONNE GAUCHE : FORMULAIRES (7/12) === */}
          <div className="lg:col-span-7 px-4 py-8 md:px-10 md:py-12 lg:border-r border-gray-100 dark:border-gray-800">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500 dark:text-gray-400">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                 <Lock className="w-5 h-5 text-green-600" /> Paiement Sécurisé
               </h1>
            </div>

            {/* --- CONTENU DYNAMIQUE --- */}
            <div className="max-w-xl">
              
              {isLoggedIn ? (
                // --- MODE CONNECTÉ ---
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center shrink-0">
                           <User className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-sm text-green-800 dark:text-green-300 font-medium">Connecté en tant que</p>
                           <p className="text-lg font-bold text-gray-900 dark:text-white">{session.user.name || session.user.email}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.user.email}</p>
                        </div>
                     </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirmation</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Votre commande sera traitée avec les informations de votre compte. 
                    Vous recevrez une confirmation par email.
                  </p>

                  <TermsCheckbox />

                  {err && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                       <div className="mt-0.5"><ShieldCheck size={16}/></div>
                       <p className="text-sm font-medium">{err}</p>
                    </div>
                  )}

                  <button
                    onClick={(e) => handleSubmit(e, 'account')}
                    disabled={loading || !acceptTerms}
                    className="
                      group w-full py-4 rounded-xl 
                      bg-green-600 text-white font-bold text-lg 
                      shadow-lg shadow-green-500/30 
                      hover:bg-green-700 hover:shadow-green-500/50 
                      transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                    {loading ? "Traitement..." : "Confirmer la commande"}
                  </button>
                </div>

              ) : (
                // --- MODE NON CONNECTÉ ---
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {!guestMode ? (
                    // CHOIX LOGIN / INVITÉ
                    <div className="space-y-6 py-8">
                       <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Identification</h2>
                          <p className="text-gray-500 dark:text-gray-400">Choisissez comment vous souhaitez passer commande.</p>
                       </div>

                       <div className="grid gap-4">
                          <button
                            onClick={() => router.push("/login?redirect=/checkout")}
                            className="
                              relative overflow-hidden w-full p-5 rounded-2xl 
                              bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                              font-bold text-lg flex items-center justify-center gap-3 
                              shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
                            "
                          >
                            <LogIn className="w-5 h-5" />
                            Se connecter (Recommandé)
                            <div className="absolute top-0 right-0 p-2 bg-green-500 text-white text-[10px] font-bold rounded-bl-xl">RAPIDE</div>
                          </button>

                          <div className="relative flex py-2 items-center">
                              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-widest">Ou</span>
                              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                          </div>

                          <button
                            onClick={() => setGuestMode(true)}
                            className="
                              w-full p-5 rounded-2xl 
                              bg-white dark:bg-gray-800 
                              border-2 border-gray-200 dark:border-gray-700
                              text-gray-700 dark:text-gray-200 font-bold text-lg 
                              flex items-center justify-center gap-3 
                              hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all
                            "
                          >
                            Continuer en tant qu'invité
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                       </div>
                    </div>

                  ) : (
                    // FORMULAIRE INVITÉ
                    <div>
                      <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coordonnées</h2>
                         <button onClick={() => setGuestMode(false)} className="text-sm font-bold text-green-600 hover:underline">
                            Changer
                         </button>
                      </div>

                      <form onSubmit={(e) => handleSubmit(e, 'guest')} className="space-y-5">
                         
                         {/* Input Group: Nom */}
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                               <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            </div>
                            <input
                              required
                              placeholder="Nom complet"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                              value={guest.name}
                              onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                            />
                         </div>

                         {/* Input Group: Email */}
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                               <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            </div>
                            <input
                              required
                              type="email"
                              placeholder="Adresse email"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                              value={guest.email}
                              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                            />
                         </div>

                         {/* Input Group: Téléphone */}
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                               <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            </div>
                            <input
                              required
                              type="tel"
                              placeholder="Numéro de téléphone"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                              value={guest.phone}
                              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                            />
                         </div>

                         {/* Input Group: Adresse */}
                         <div className="relative group">
                            <div className="absolute top-4 left-4 pointer-events-none">
                               <Home className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            </div>
                            <textarea
                              required
                              placeholder="Adresse de livraison complète (Quartier, Ville, Repères...)"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 min-h-[120px] resize-none"
                              value={guest.deliveryAddress}
                              onChange={(e) => setGuest({ ...guest, deliveryAddress: e.target.value })}
                            />
                         </div>

                         <TermsCheckbox />

                         {err && (
                           <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                              <ShieldCheck size={18} /> {err}
                           </div>
                         )}

                         <button
                           type="submit"
                           disabled={loading || !acceptTerms}
                           className="
                             group w-full py-4 rounded-xl 
                             bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                             font-black text-lg uppercase tracking-wide
                             shadow-xl hover:shadow-2xl hover:scale-[1.01] 
                             transition-all disabled:opacity-50
                             flex items-center justify-center gap-2
                           "
                         >
                           {loading ? "Validation..." : "Payer la commande"}
                           {!loading && <CreditCard size={20} />}
                         </button>

                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* === COLONNE DROITE : RÉCAPITULATIF (5/12) - STICKY === */}
          <div className="lg:col-span-5 bg-gray-50 dark:bg-gray-900 px-4 py-8 md:px-10 md:py-12 border-t lg:border-t-0 border-gray-200 dark:border-gray-800">
            <div className="lg:sticky lg:top-12">
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Récapitulatif</h2>

              {/* Liste des articles (Scrollable si trop longue) */}
              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                 {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 items-start">
                       <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shrink-0">
                          {item.imageUrl ? (
                             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={20}/></div>
                          )}
                          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                             {item.quantity}
                          </span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.price.toLocaleString()} FCFA / unité</p>
                       </div>
                       <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {(item.price * item.quantity).toLocaleString()} 
                       </div>
                    </div>
                 ))}
              </div>

              {/* Totaux */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span>{totalPrice.toLocaleString()} FCFA</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">À calculer</span>
                 </div>
              </div>

              {/* Total Final */}
              <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 flex justify-between items-center">
                 <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                 <span className="text-3xl font-black text-green-600 dark:text-green-400 tracking-tight">
                    {totalPrice.toLocaleString()} <span className="text-sm font-bold text-gray-500">FCFA</span>
                 </span>
              </div>

              {/* Badges de Réassurance */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800 p-2 rounded-lg justify-center">
                    <ShieldCheck size={14} className="text-green-600"/> Paiement Sécurisé
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800 p-2 rounded-lg justify-center">
                    <Lock size={14} className="text-green-600"/> Données chiffrées
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}