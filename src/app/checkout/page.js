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
  CheckCircle2 
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Commande échouée");
    return data;
  }

  async function submitGuest(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!guest.name || !guest.email || !guest.phone || !guest.deliveryAddress) {
        throw new Error("Tous les champs sont obligatoires.");
      }

      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        deliveryAddress: guest.deliveryAddress,
        contactPhone: guest.phone,
        guest
      };

      const data = await createOrder(payload);
      clear();
      router.push(`/order/success?code=${data.orderCode}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAccount(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // Pour les comptes connectés, on utilise les infos de base
      // On pourrait aussi ajouter un formulaire d'adresse ici
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        deliveryAddress: "Adresse enregistrée", // À dynamiser si besoin
        contactPhone: session.user.phone || "Non renseigné"
      };

      const data = await createOrder(payload);
      clear();
      router.push(`/order/success?code=${data.orderCode}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
               <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
              Paiement
            </h1>
          </div>

          {/* RÉCAPITULATIF COMMANDE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Résumé</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Nombre d'articles</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <span className="text-gray-800 font-medium">Total à payer</span>
                <span className="text-2xl font-black text-brand-green">{totalPrice.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* LOGIQUE D'AFFICHAGE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            
            {isLoggedIn ? (
              /* ================= MODE CONNECTÉ ================= */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-brand-green">
                  Prêt à commander ?
                </h2>
                <p className="text-gray-500 mb-8">
                  Votre commande sera associée à : <br/>
                  <span className="font-bold text-gray-700">{session.user.email}</span>
                </p>

                {err && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{err}</div>}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={submitAccount}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-brand-green text-white font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Traitement..." : "Confirmer ma commande"}
                  </button>
                  <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-800 font-medium py-2">
                    Modifier mon panier
                  </Link>
                </div>
              </div>

            ) : (
              /* ================= MODE NON CONNECTÉ ================= */
              <div className="p-1">
                {!guestMode ? (
                  <div className="p-8 space-y-6 text-center">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-gray-800">Comment souhaitez-vous continuer ?</h2>
                      <p className="text-sm text-gray-500">Connectez-vous pour suivre vos commandes plus facilement.</p>
                    </div>

                    <div className="grid gap-4">
                      <button
                        onClick={() => router.push("/login?redirect=/checkout")}
                        className="w-full border-2 border-gray-400 py-4 rounded-xl bg-brand-green text-gray-800 font-bold flex items-center justify-center gap-3 hover:bg-green-700 hover:text-white transition shadow-md"
                      >
                        <LogIn className="w-5 h-5" />
                        Se connecter
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Ou</span></div>
                      </div>

                      <button
                        onClick={() => setGuestMode(true)}
                        className="w-full py-4 rounded-xl border-2 border-gray-400 font-bold text-gray-700 hover:bg-orange-500 hover:text-white transition"
                      >
                        Continuer en tant qu'invité
                      </button>
                    </div>
                  </div>
                ) : (
                  /* === FORMULAIRE INVITÉ (DESIGN AMÉLIORÉ) === */
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Infos de livraison</h2>
                        <button onClick={() => setGuestMode(false)} className="text-xs font-bold text-brand-orange uppercase bg-orange-500 rounded-sm w-[13%] hover:bg-orange-600 hover:text-white">Retour</button>
                    </div>

                    <form onSubmit={submitGuest} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          placeholder="Nom complet"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none transition"
                          value={guest.name}
                          onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="Adresse email (pour le reçu)"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none transition"
                          value={guest.email}
                          onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="Téléphone (ex: 0700000000)"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none transition"
                          value={guest.phone}
                          onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Home className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          placeholder="Adresse précise de livraison (Ville, Quartier...)"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none transition min-h-[120px]"
                          value={guest.deliveryAddress}
                          onChange={(e) => setGuest({ ...guest, deliveryAddress: e.target.value })}
                          required
                        />
                      </div>

                      {err && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{err}</div>}

                      {/* BOUTON PÉTILLANT */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          group relative w-[60%] py-5 mt-4 rounded-2xl overflow-hidden
                          text-orange-500 bg-gray-800 font-black uppercase tracking-[2px] 
                          transition-all duration-500 
                          hover:animate-sparkle-move 
                          hover:shadow-2xl active:scale-95
                          hover:text-white
                          hover:bg-orange-500
                          disabled:opacity-60 border border-white/20
                        "
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                        <span className="relative z-10">
                          {loading ? "Validation..." : "Confirmer ma commande"}
                        </span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}