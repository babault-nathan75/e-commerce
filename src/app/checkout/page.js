"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, User, Home, LogIn } from "lucide-react";

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

  const [account, setAccount] = useState({
    contactPhone: "",
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
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        deliveryAddress: account.deliveryAddress,
        contactPhone: account.contactPhone
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

  if (status === "loading") return <div>Chargement...</div>;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-green">
              Finaliser la commande
            </h1>
          </div>

          {/* RÉCAP */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
            <div className="flex justify-between">
              <span>Articles</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="flex justify-between mt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-brand-orange">{totalPrice} FCFA</span>
            </div>
          </div>

          {/* ================= CONNECTÉ ================= */}
          {isLoggedIn ? (
              /* ================= CONNECTÉ ================= */
              <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
                <h2 className="text-xl font-bold mb-2 text-brand-green">
                  Prêt à commander 🚀
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  Connecté en tant que <strong>{session.user.email}</strong>
                </p>

                {err && <p className="text-red-600 mb-3">{err}</p>}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={submitAccount}
                    disabled={loading}
                    className="
                      flex-1 sm:flex-none
                      px-8 py-3 rounded-xl
                      bg-green-500 text-white
                      font-bold text-lg
                      hover:opacity-90
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Commande en cours..." : "Commander"}
                  </button>

                  <Link
                    href="/cart"
                    className="
                      px-6 py-3 rounded-xl
                      border font-semibold
                      hover:bg-gray-900
                      hover:text-white
                    "
                  >
                    Retour
                  </Link>

                  <Link
                    href="/"
                    className="
                      px-6 py-3 rounded-xl
                      border font-semibold
                      hover:bg-gray-900
                      hover:text-white
                    "
                  >
                    Accueil
                  </Link>
                </div>
              </div>
            ) : (
              /* ================= NON CONNECTÉ ================= */
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                {!guestMode ? (
                  <div className="space-y-4 text-center">
                    <button
                      onClick={() =>
                        router.push("/login?redirect=/checkout")
                      }
                      className="
                        w-full py-3 rounded-xl
                        bg-brand-green text-white
                        font-bold flex items-center
                        justify-center gap-2
                      "
                    >
                      Connexion
                    </button>

                    <button
                      onClick={() => setGuestMode(true)}
                      className="
                        w-full py-3 rounded-xl
                        border font-semibold
                      "
                    >
                      Commander en mode invité
                    </button>
                  </div>
                ) : (
                  /* === FORMULAIRE INVITÉ (inchangé) === */
                  <form onSubmit={submitGuest} className="space-y-4">
                    <input
                      placeholder="Nom"
                      className="w-full border rounded-lg px-3 py-2"
                      value={guest.name}
                      onChange={(e) =>
                        setGuest({ ...guest, name: e.target.value })
                      }
                    />
                    <input
                      placeholder="Email"
                      className="w-full border rounded-lg px-3 py-2"
                      value={guest.email}
                      onChange={(e) =>
                        setGuest({ ...guest, email: e.target.value })
                      }
                    />
                    <input
                      placeholder="Téléphone"
                      className="w-full border rounded-lg px-3 py-2"
                      value={guest.phone}
                      onChange={(e) =>
                        setGuest({ ...guest, phone: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Adresse de livraison"
                      className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                      value={guest.deliveryAddress}
                      onChange={(e) =>
                        setGuest({
                          ...guest,
                          deliveryAddress: e.target.value
                        })
                      }
                    />

                    {err && <p className="text-red-600">{err}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full py-3 rounded-xl
                        bg-brand-orange text-white
                        font-bold
                      "
                    >
                      {loading ? "Validation..." : "Confirmer la commande"}
                    </button>
                  </form>
                )}
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
