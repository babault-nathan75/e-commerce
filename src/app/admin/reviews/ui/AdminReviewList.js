"use client";

import { useState } from "react";

export default function AdminReviewList({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [err, setErr] = useState("");

  async function remove(id) {
    setErr("");
    if (!confirm("Supprimer ce commentaire ?")) return;

    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Suppression impossible");
      return;
    }
    setReviews((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div>
      {err ? <p className="text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="border rounded p-3">
            <div className="text-sm text-gray-600">
              Produit: {String(r.productId)} • User: {String(r.userId)}
            </div>
            <div className="font-semibold mt-1">{r.userName} • {r.rating}/5</div>
            <div className="text-xs text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{r.comment}</p>

            <button type="button" className="mt-2 underline text-red-600" onClick={() => remove(r._id)}>
              Supprimer
            </button>
          </div>
        ))}

        {reviews.length === 0 ? <p className="text-gray-600">Aucun commentaire.</p> : null}
      </div>
    </div>
  );
}