"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

    const code = orderCode.trim();
    const mail = email.trim().toLowerCase();

    if (!code || !mail) {
      setErr("Code commande et email sont requis.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderCode=${encodeURIComponent(code)}&email=${encodeURIComponent(mail)}`,
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
    setCancelMsg("");
    setErr("");

    const reason = cancelReason.trim();
    if (reason.length < 5) {
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
          cancelReason: reason
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Annulation échouée");

      setCancelMsg("Commande annulée avec succès.");
      // Recharge la commande pour afficher l'état annulé
      await loadOrder();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setCancelLoading(false);
    }
  }

  // Auto-load si code+email dans l’URL
  useEffect(() => {
    if ((sp.get("code") || "") && (sp.get("email") || "")) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Suivi commande</h1>

      <form onSubmit={loadOrder} className="mt-4 border rounded p-4 space-y-3">
        <div>
          <label className="block text-sm">Code commande</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="ex: ME-20251229-AB12CD"
          />
        </div>

        <div>
          <label className="block text-sm">Email (invité)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: client@email.com"
          />
        </div>

        {err ? <p className="text-red-600">{err}</p> : null}

        <button
          className="px-4 py-2 rounded bg-brand-orange text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {order ? (
        <div className="mt-6 border rounded p-4">
          <h2 className="text-xl font-bold">Fiche de commande</h2>

          <div className="mt-3 grid gap-1 text-sm">
            <div><strong>Code:</strong> {order.orderCode}</div>
            <div><strong>Statut:</strong> {order.status}</div>
            <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
            <div><strong>Nom:</strong> {order.name}</div>
            <div><strong>Email:</strong> {order.email}</div>
            <div><strong>Contact:</strong> {order.contact}</div>
            <div><strong>Adresse de livraison:</strong> {order.deliveryAddress}</div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Articles commandés</h3>
            <div className="mt-2 space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between border rounded p-2">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      {it.quantity} × {it.price} FCFA
                    </div>
                  </div>
                  <div className="font-bold text-brand-green">
                    {it.quantity * it.price} FCFA
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border rounded p-3">
              <div className="flex justify-between">
                <span>Total articles</span>
                <strong>{order.totalItems}</strong>
              </div>
              <div className="flex justify-between mt-2">
                <span>Total</span>
                <strong className="text-brand-orange">{order.totalPrice} FCFA</strong>
              </div>
            </div>
          </div>

          {/* Annulation invité */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold">Annuler la commande</h3>

            {!canCancel ? (
              <p className="text-sm text-gray-600 mt-2">
                Annulation indisponible (commande livrée ou déjà annulée).
              </p>
            ) : (
              <>
                <label className="block text-sm mt-3">Justificatif</label>
                <textarea
                  className="border rounded px-3 py-2 w-full min-h-24"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explique pourquoi tu annules la commande..."
                />
                {cancelMsg ? <p className="text-green-700 mt-2">{cancelMsg}</p> : null}
                <button
                  className="mt-3 px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60"
                  disabled={cancelLoading}
                  type="button"
                  onClick={cancelGuestOrder}
                >
                  {cancelLoading ? "Annulation..." : "Annuler"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <Link className="underline text-brand-green" href="/">
          Retour accueil
        </Link>
      </div>
    </div>
  );
}