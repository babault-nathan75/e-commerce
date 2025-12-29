"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.quantity * i.price, 0), [items]);

  const [common, setCommon] = useState({
    deliveryAddress: "",
    contactPhone: ""
  });

  const [guest, setGuest] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: ""
  });

  const [mode, setMode] = useState("guest"); // "guest" ou "account" (si connecté)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isLoggedIn = !!session?.user;

  async function createOrder(payload) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Commande échouée");
    return data; // { ok, orderId, orderCode }
  }

  async function onSubmitGuest(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (items.length === 0) throw new Error("Ton panier est vide.");

      // Champs invités requis
      if (!guest.name || guest.name.trim().length < 2) throw new Error("Nom invité invalide.");
      if (!guest.email || !guest.email.includes("@")) throw new Error("Email invité invalide.");
      if (!guest.phone || guest.phone.trim().length < 6) throw new Error("Téléphone invité invalide.");
      if (!guest.deliveryAddress || guest.deliveryAddress.trim().length < 5) throw new Error("Adresse de livraison invalide.");

      // On duplique aussi en common pour la fiche
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: guest.deliveryAddress,
        contactPhone: guest.phone,
        guest: {
          name: guest.name.trim(),
          email: guest.email.trim().toLowerCase(),
          phone: guest.phone.trim(),
          deliveryAddress: guest.deliveryAddress.trim()
        }
      };

      const data = await createOrder(payload);

      clear();
      router.push(`/order/success?code=${encodeURIComponent(data.orderCode)}&email=${encodeURIComponent(payload.guest.email)}`);
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAccount(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!isLoggedIn) throw new Error("Tu dois être connecté.");
      if (items.length === 0) throw new Error("Ton panier est vide.");
      if (!common.deliveryAddress || common.deliveryAddress.trim().length < 5) throw new Error("Adresse de livraison invalide.");
      if (!common.contactPhone || common.contactPhone.trim().length < 6) throw new Error("Contact invalide.");

      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: common.deliveryAddress.trim(),
        contactPhone: common.contactPhone.trim()
      };

      const data = await createOrder(payload);

      clear();
      router.push(`/order/success?code=${encodeURIComponent(data.orderCode)}`);
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Checkout</h1>

      <div className="mt-3 border rounded p-4">
        <div className="flex justify-between">
          <span>Total articles</span>
          <strong>{totalItems}</strong>
        </div>
        <div className="flex justify-between mt-2">
          <span>Total</span>
          <strong className="text-brand-orange">{totalPrice} FCFA</strong>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <p>Ton panier est vide.</p>
          <Link className="underline text-brand-orange" href="/cart">Retour au panier</Link>
        </div>
      ) : null}

      {/* Si pas connecté : proposer register/login + invité */}
      {!isLoggedIn ? (
        <div className="mt-6 space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold">Pour commander, tu as 3 options</h2>
            <ul className="list-disc pl-6 mt-2">
              <li><Link className="underline text-brand-green" href="/register">S’inscrire</Link></li>
              <li><Link className="underline text-brand-green" href="/login">Se connecter</Link></li>
              <li>Continuer en tant qu’invité (formulaire ci-dessous)</li>
            </ul>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold">Commander en invité</h2>

            <form className="mt-3 space-y-3" onSubmit={onSubmitGuest}>
              <div>
                <label className="block text-sm">Nom du client</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm">Contact</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm">Email</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm">Lieu de livraison</label>
                <textarea
                  className="border rounded px-3 py-2 w-full min-h-24"
                  value={guest.deliveryAddress}
                  onChange={(e) => setGuest({ ...guest, deliveryAddress: e.target.value })}
                />
              </div>

              {err ? <p className="text-red-600">{err}</p> : null}

              <button
                className="px-4 py-2 rounded bg-brand-orange text-white disabled:opacity-60"
                disabled={loading || items.length === 0}
                type="submit"
              >
                {loading ? "Validation..." : "Confirmer la commande (invité)"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Connecté
        <div className="mt-6 border rounded p-4">
          <h2 className="font-semibold">Commander avec ton compte</h2>
          <p className="text-sm text-gray-600 mt-1">
            Connecté en tant que: <strong>{session.user.email}</strong>
          </p>

          <div className="mt-4">
            <div className="flex gap-3">
              <button
                type="button"
                className={`px-3 py-2 rounded border ${mode === "account" ? "border-brand-green" : ""}`}
                onClick={() => setMode("account")}
              >
                Mode compte
              </button>
              <button
                type="button"
                className={`px-3 py-2 rounded border ${mode === "guest" ? "border-brand-green" : ""}`}
                onClick={() => setMode("guest")}
              >
                Mode invité (optionnel)
              </button>
            </div>
          </div>

          {mode === "account" ? (
            <form className="mt-4 space-y-3" onSubmit={onSubmitAccount}>
              <div>
                <label className="block text-sm">Contact</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={common.contactPhone}
                  onChange={(e) => setCommon({ ...common, contactPhone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm">Lieu de livraison</label>
                <textarea
                  className="border rounded px-3 py-2 w-full min-h-24"
                  value={common.deliveryAddress}
                  onChange={(e) => setCommon({ ...common, deliveryAddress: e.target.value })}
                />
              </div>

              {err ? <p className="text-red-600">{err}</p> : null}

              <button
                className="px-4 py-2 rounded bg-brand-green text-white disabled:opacity-60"
                disabled={loading || items.length === 0}
                type="submit"
              >
                {loading ? "Validation..." : "Confirmer la commande"}
              </button>
            </form>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Si tu veux commander comme invité malgré la connexion, tu peux te déconnecter et utiliser le formulaire invité.
              </p>
              <Link className="underline text-brand-orange" href="/cart">
                Retour panier
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}