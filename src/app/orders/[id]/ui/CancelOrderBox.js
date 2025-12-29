"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderBox({ orderId, canCancel }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function cancel() {
    setErr("");
    setMsg("");

    const r = reason.trim();
    if (r.length < 5) {
      setErr("Justificatif trop court (min 5 caractères).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: r })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Annulation échouée");

      setMsg("Commande annulée.");
      router.refresh();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">Annulation</h3>

      {!canCancel ? (
        <p className="text-sm text-gray-600 mt-2">Annulation indisponible (livrée ou déjà annulée).</p>
      ) : (
        <>
          <label className="block text-sm mt-3">Justificatif</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-24"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {err ? <p className="text-red-600 mt-2">{err}</p> : null}
          {msg ? <p className="text-green-700 mt-2">{msg}</p> : null}

          <button
            className="mt-3 px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60"
            disabled={loading}
            onClick={cancel}
            type="button"
          >
            {loading ? "Annulation..." : "Annuler la commande"}
          </button>
        </>
      )}
    </div>
  );
}