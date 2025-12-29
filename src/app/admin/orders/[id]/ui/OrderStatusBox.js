"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const nextStatusMap = {
  EFFECTUER: "EN_COURS_DE_LIVRAISON",
  EN_COURS_DE_LIVRAISON: "LIVRER",
  LIVRER: null
};

export default function OrderStatusBox({ orderId, status, canceledAt }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const nextStatus = useMemo(() => nextStatusMap[status] || null, [status]);
  const disabled = !!canceledAt || !nextStatus;

  async function goNext() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Changement de statut échoué");

      setMsg(`Statut mis à jour: ${data.order.status}`);
      router.refresh();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">Gestion statut (Admin)</h3>

      <div className="mt-2 text-sm">
        <div>Statut actuel: <strong>{status}</strong></div>
        <div>Prochain statut autorisé: <strong>{nextStatus || "Aucun (déjà livré)"}</strong></div>
        {canceledAt ? <div className="text-red-700 mt-1">Commande annulée: statut non modifiable.</div> : null}
      </div>

      {err ? <p className="text-red-600 mt-2">{err}</p> : null}
      {msg ? <p className="text-green-700 mt-2">{msg}</p> : null}

      <button
        type="button"
        className="mt-3 px-4 py-2 rounded bg-brand-green text-white disabled:opacity-60"
        disabled={disabled || loading}
        onClick={goNext}
      >
        {loading ? "Mise à jour..." : "Passer au prochain statut"}
      </button>
    </div>
  );
}