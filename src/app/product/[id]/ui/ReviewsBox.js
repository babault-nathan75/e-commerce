"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ReviewsBox({ productId }) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/products/${productId}/reviews`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setReviews(data.reviews || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!session?.user) {
      setErr("Connecte-toi pour noter/commenter.");
      return;
    }
    if (comment.trim().length < 2) {
      setErr("Commentaire trop court.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: Number(rating), comment })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");

      setComment("");
      setRating(5);
      await load();
    } catch (e2) {
      setErr(e2.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function remove(reviewId) {
    setErr("");
    if (!confirm("Supprimer ce commentaire ?")) return;

    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Suppression impossible");
      return;
    }
    await load();
  }

  return (
    <div className="mt-8 border rounded p-4">
      <h2 className="text-lg font-bold">Notes & commentaires</h2>

      <form onSubmit={submit} className="mt-3 space-y-2">
        <div className="flex gap-3 items-center">
          <label className="text-sm">Note</label>
          <select
            className="border rounded px-2 py-1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <textarea
          className="border rounded px-3 py-2 w-full min-h-24"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Écris ton commentaire..."
        />

        {err ? <p className="text-red-600 text-sm">{err}</p> : null}

        <button
          className="px-4 py-2 rounded bg-brand-green text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Envoi..." : "Publier"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="border rounded p-3">
            <div className="flex justify-between gap-3">
              <div className="font-semibold">
                {r.userName} • {r.rating}/5
              </div>
              <div className="text-xs text-gray-600">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{r.comment}</p>

            {session?.user ? (
              <button
                type="button"
                className="mt-3 underline text-red-600"
                onClick={() => remove(r._id)}
              >
                Supprimer
              </button>
            ) : null}
          </div>
        ))}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun commentaire pour le moment.</p>
        ) : null}
      </div>
    </div>
  );
}