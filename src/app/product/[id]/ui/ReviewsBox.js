"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StarInput from "@/components/ui/StarInput";
import StarRating from "@/components/ui/StarRating";

export default function ReviewsBox({ productId }) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(
      `/api/products/${productId}/reviews`,
      { cache: "no-store" }
    );
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
      setErr("Connecte-toi pour laisser un avis.");
      return;
    }
    if (comment.trim().length < 2) {
      setErr("Commentaire trop court.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: Number(rating),
            comment
          })
        }
      );

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

  async function remove(review) {
    setErr("");

    const isOwner = review.userId === session?.user?.id;
    const isAdmin = session?.user?.isAdmin;

    if (!isOwner && !isAdmin) {
      setErr("Suppression non autorisée.");
      return;
    }

    if (!confirm("Supprimer ce commentaire ?")) return;

    const res = await fetch(
      `/api/reviews/${review._id}`,
      { method: "DELETE" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Suppression impossible");
      return;
    }
    await load();
  }

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-14">
      {/* ===== HEADER AVIS ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Avis clients
          </h2>
          <div className="mt-1">
            <StarRating
              value={avg}
              count={reviews.length}
              size={18}
            />
          </div>
        </div>
      </div>

      {/* ===== FORMULAIRE ===== */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              Votre note
            </span>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <textarea
            className="
              w-full min-h-28
              rounded-xl border border-gray-300
              px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-green
              transition
            "
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partage ton expérience avec ce produit..."
          />

          {err && (
            <p className="text-sm text-red-600">
              {err}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="
              inline-flex items-center justify-center
              px-6 py-3 rounded-xl
              bg-gradient-to-r from-brand-green to-green-500
              text-white font-semibold
              shadow-md
              hover:shadow-lg hover:scale-[1.02]
              transition
              disabled:opacity-60
            "
          >
            {loading ? "Publication..." : "Publier l’avis"}
          </button>
        </form>
      </div>

      {/* ===== LISTE DES AVIS ===== */}
      <div className="mt-8 space-y-5">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="
              bg-white
              border rounded-2xl
              p-5
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {r.userName}
                  </span>
                  <StarRating value={r.rating} size={14} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              {(session?.user?.isAdmin ||
                r.userId === session?.user?.id) && (
                <button
                  onClick={() => remove(r)}
                  className="
                    text-xs font-semibold text-red-600
                    hover:underline
                  "
                >
                  Supprimer
                </button>
              )}
            </div>

            <p className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {r.comment}
            </p>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-6">
            Aucun avis pour le moment.
          </div>
        )}
      </div>
    </section>
  );
}
