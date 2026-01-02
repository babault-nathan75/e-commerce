import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import AddToCartButton from "./ui/AddToCartButton";
import FavoriteButton from "./ui/FavoriteButton";
import ReviewsBox from "./ui/ReviewsBox";
import StarRating from "@/components/ui/StarRating";

async function getReviews(productId) {
  const res = await fetch(
    `http://localhost:3000/api/products/${productId}/reviews`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews || [];
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params; // ✅ Next.js 16

  await connectDB();
  const p = await Product.findById(id).lean();
  if (!p) return <div className="py-20 text-center">Produit introuvable.</div>;

  const reviews = await getReviews(id);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 flex justify-center">
          <div className="w-full h-[420px] bg-gray-50 rounded-xl flex items-center justify-center">
            <img
              src={p.imageUrl}
              alt={p.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* INFOS */}
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">
            {p.name}
          </h1>

          {/* ⭐ NOTATION PRO */}
          <StarRating
            value={avg}
            count={reviews.length}
            size={20}
          />

          <div className="text-3xl font-extrabold text-brand-orange">
            {p.price} FCFA
          </div>

          <div className="text-green-600 font-semibold text-sm">
            ✔ En stock
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {p.description}
          </p>

          <div className="flex items-center gap-4">
            <AddToCartButton
              product={{
                productId: p._id.toString(),
                name: p.name,
                price: p.price,
                imageUrl: p.imageUrl
              }}
            />
          </div>
          <div className="text-pink-600 active:text-blue-800">
            <FavoriteButton productId={p._id.toString()} />
          </div>

        </div>
      </div>

      {/* AVIS */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold mb-4">
          Avis des clients
        </h2>
        <ReviewsBox productId={p._id.toString()} />
      </div>
    </div>
  );
}
