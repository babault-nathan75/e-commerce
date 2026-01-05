"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function OrderTrackPage() {
  const sp = useSearchParams();

  const [orderCode, setOrderCode] = useState(sp.get("code") || "");
  const [email, setEmail] = useState(sp.get("email") || "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const canCancel = useMemo(() => {
    if (!order) return false;
    if (order.status === "LIVRER") return false;
    if (order.canceledAt) return false;
    return true;
  }, [order]);

  async function loadOrder(e) {
    if (e) e.preventDefault();
    setErr("");
    setOrder(null);
    setCancelMsg("");

    if (!orderCode.trim() || !email.trim()) {
      setErr("Le code de commande et l’email sont requis.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderCode=${encodeURIComponent(
          orderCode.trim()
        )}&email=${encodeURIComponent(email.trim().toLowerCase())}`,
        { cache: "no-store" }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Commande introuvable");

      setOrder(data.order);
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function cancelGuestOrder() {
    setErr("");
    setCancelMsg("");

    if (cancelReason.trim().length < 5) {
      setErr("Justificatif trop court (min 5 caractères).");
      return;
    }

    setCancelLoading(true);
    try {
      const res = await fetch("/api/orders/guest/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: orderCode.trim(),
          email: email.trim().toLowerCase(),
          cancelReason: cancelReason.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Annulation échouée");

      setCancelMsg("Commande annulée avec succès.");
      await loadOrder();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setCancelLoading(false);
    }
  }

  useEffect(() => {
    if (sp.get("code") && sp.get("email")) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* ===== HEADER ===== */}
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-brand-orange" />
            <h1 className="text-3xl font-extrabold text-brand-green">
              Suivi de commande
            </h1>
          </div>

          {/* ===== FORM ===== */}
          <form
            onSubmit={loadOrder}
            className="bg-white rounded-2xl shadow-md border p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Code de commande</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="ME-20250101-AB12CD"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email (invité)</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
              />
            </div>

            {err && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                {err}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="
                w-[30%] py-3 rounded-xl
                bg-brand-orange text-green-500 font-semibold
                border 
                hover:opacity-90 transition
                disabled:opacity-60
              "
            >
              {loading ? "Recherche..." : "Rechercher ma commande"}
            </button>
            <p className="mt-2 text-sm text-gray-600"> 
              NB: Le suivi de commande est reservé uniquement aux clients qui passent leur commande en mode <b>"invité"</b>.
            </p>
          </form>

          {/* ===== ORDER DETAILS ===== */}
          {order && (
            <div className="mt-8 bg-white rounded-2xl shadow-md border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-brand-green" />
                <h2 className="text-xl font-bold">
                  Commande {order.orderCode}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><strong>Statut :</strong> {order.status}</div>
                <div><strong>Date :</strong> {new Date(order.createdAt).toLocaleString()}</div>
                <div><strong>Client :</strong> {order.name}</div>
                <div><strong>Email :</strong> {order.email}</div>
                <div><strong>Contact :</strong> {order.contact}</div>
                <div className="sm:col-span-2">
                  <strong>Adresse :</strong> {order.deliveryAddress}
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Articles</h3>
                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border rounded-lg p-3"
                    >
                      <div>
                        <div className="font-semibold">{it.name}</div>
                        <div className="text-xs text-gray-600">
                          {it.quantity} × {it.price} FCFA
                        </div>
                      </div>
                      <div className="font-bold text-brand-green">
                        {it.quantity * it.price} FCFA
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>Total articles</span>
                    <strong>{order.totalItems}</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Total</span>
                    <strong className="text-brand-orange">
                      {order.totalPrice} FCFA
                    </strong>
                  </div>
                </div>
              </div>

              {/* CANCEL */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-2">Annulation</h3>

                {!canCancel ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    Annulation indisponible
                  </div>
                ) : (
                  <>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 min-h-24"
                      placeholder="Motif d’annulation…"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />

                    {cancelMsg && (
                      <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                        <CheckCircle className="w-4 h-4" />
                        {cancelMsg}
                      </div>
                    )}

                    <button
                      disabled={cancelLoading}
                      onClick={cancelGuestOrder}
                      className="
                        mt-3 px-4 py-2 rounded-lg
                        bg-red-600 text-white font-semibold
                        hover:opacity-90
                        disabled:opacity-60
                      "
                    >
                      {cancelLoading ? "Annulation..." : "Annuler la commande"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-brand-green font-semibold border px-4 py-2 rounded-xl bg-white">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
