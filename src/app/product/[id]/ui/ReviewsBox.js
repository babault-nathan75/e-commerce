"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StarInput from "@/components/ui/StarInput";
import StarRating from "@/components/ui/StarRating";
import { 
  MessageSquare, 
  Trash2, 
  Send, 
  Star, 
  User, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";

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
  }, [productId]);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!session?.user) {
      setErr("Veuillez vous connecter pour laisser un avis.");
      return;
    }
    if (comment.trim().length < 2) {
      setErr("Votre commentaire est un peu trop court.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(rating),
          comment
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de la publication");

      setComment("");
      setRating(5);
      await load();
    } catch (e2) {
      setErr(e2.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function remove(review) {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;

    const res = await fetch(`/api/reviews/${review._id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-20 max-w-4xl">
      {/* ===== HEADER & RÉSUMÉ ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="text-green-500" size={28} />
            Avis de la communauté
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Partagez votre expérience avec les autres acheteurs.
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 dark:text-white">{avg.toFixed(1)}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sur 5</div>
            </div>
            <div className="h-10 w-px bg-gray-100 dark:bg-gray-800"></div>
            <div>
              <StarRating value={avg} size={20} />
              <div className="text-xs font-bold text-green-600 mt-1">{reviews.length} avis vérifiés</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== FORMULAIRE DE SAISIE ===== */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-xl shadow-gray-200/40 dark:shadow-none mb-12">
        <form onSubmit={submit} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              {session?.user?.name ? (
                <span className="font-bold text-gray-600 dark:text-gray-300">{session.user.name[0].toUpperCase()}</span>
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Quelle note donneriez-vous ?</div>
              <StarInput value={rating} onChange={setRating} />
            </div>
          </div>

          <div className="relative">
            <textarea
              className="
                w-full min-h-[120px]
                rounded-2xl border-2 border-gray-50 dark:border-gray-800
                bg-gray-50 dark:bg-gray-800/50
                px-5 py-4 text-sm text-gray-900 dark:text-white
                focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-800
                transition-all duration-300 resize-none
              "
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Écrivez votre avis ici... Qu'avez-vous aimé ou moins aimé ?"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {err ? (
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs animate-in fade-in slide-in-from-left-2">
                <AlertCircle size={16} /> {err}
              </div>
            ) : (
              <div className="text-xs text-gray-400 font-medium">
                Votre avis sera visible publiquement après publication.
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="
                inline-flex items-center justify-center gap-2
                px-8 py-4 rounded-2xl
                bg-gray-900 dark:bg-white text-white dark:text-gray-900
                font-black uppercase tracking-widest text-xs
                hover:bg-green-600 dark:hover:bg-green-500 hover:text-white
                transition-all duration-300 disabled:opacity-50
                shadow-lg shadow-gray-200 dark:shadow-none
              "
            >
              {loading ? "Traitement..." : <>Publier l’avis <Send size={14} /></>}
            </button>
          </div>
        </form>
      </div>

      {/* ===== LISTE DES AVIS ===== */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Derniers commentaires</h3>
        
        {reviews.map((r) => {
          const isMyReview = r.userId === session?.user?.id;
          const isAdmin = session?.user?.isAdmin;

          return (
            <div
              key={r._id}
              className="
                bg-white dark:bg-gray-900
                border border-gray-100 dark:border-gray-800
                rounded-3xl p-6
                shadow-sm hover:shadow-md transition-shadow
                relative overflow-hidden
              "
            >
              {/* Marqueur "Mon avis" */}
              {isMyReview && <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">Mon avis</div>}

              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-sm">
                    {r.userName ? r.userName[0].toUpperCase() : <User size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {r.userName}
                      </span>
                      {isAdmin && <ShieldCheck className="text-blue-500" size={14} title="Administrateur" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating value={r.rating} size={12} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {(isAdmin || isMyReview) && (
                  <button
                    onClick={() => remove(r)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Supprimer l'avis"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="mt-5 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pl-1">
                {r.comment}
              </div>
            </div>
          );
        })}

        {reviews.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-12 text-center">
            <Star className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Soyez le premier à donner votre avis sur ce produit !
            </p>
          </div>
        )}
      </div>
    </section>
  );
}