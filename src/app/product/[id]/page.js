import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review"; 
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddToCartButton from "./ui/AddToCartButton";
import FavoriteButton from "./ui/FavoriteButton";
import ReviewsBox from "./ui/ReviewsBox";
import StarRating from "@/components/ui/StarRating";
import { Box, AlertTriangle, CheckCircle2 } from "lucide-react";

async function getReviews(productId) {
  try {
    await connectDB();
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    return reviews || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    return [];
  }
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params; 

  await connectDB();
  const p = await Product.findById(id).lean();

  if (!p) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-600">
          Produit introuvable.
        </div>
      </DashboardLayout>
    );
  }

  const reviews = await getReviews(id);
  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // ✅ LOGIQUE DE STOCK CORRIGÉE
  const stockQty = Number(p.stockAvailable ?? 0);
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* IMAGE */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 flex justify-center">
              <div className="w-full h-[420px] bg-gray-50 rounded-xl flex items-center justify-center">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className={`max-h-full max-w-full object-contain ${
                    isOutOfStock ? "grayscale opacity-50" : ""
                  }`}
                />
              </div>
            </div>

            {/* INFOS */}
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-gray-900">
                {p.name}
              </h1>

              <StarRating
                value={avg}
                count={reviews.length}
                size={20}
              />

              <div className="text-3xl font-extrabold text-brand-orange">
                {p.price.toLocaleString()} FCFA
              </div>

              {/* STOCK */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm ${
                  isOutOfStock
                    ? "bg-red-50 text-red-600 border-red-100"
                    : isLowStock
                    ? "bg-orange-50 text-orange-600 border-orange-100 animate-pulse"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <AlertTriangle size={16} /> Épuisé
                  </>
                ) : isLowStock ? (
                  <>
                    <Box size={16} /> Stock critique : {stockQty} restant(s)
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> En stock : {stockQty} articles disponibles
                  </>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {p.description}
              </p>

              {/* ACTIONS */}
              <div className="flex items-center gap-4">
                <AddToCartButton
                  disabled={isOutOfStock}
                  product={{
                    productId: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    imageUrl: p.imageUrl,
                    stock: stockQty // ✅ cohérent avec stockAvailable
                  }}
                />
              </div>

              <div className="text-pink-600">
                <FavoriteButton productId={p._id.toString()} />
              </div>
            </div>
          </div>

          {/* AVIS */}
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-4">
              Avis des clients ({reviews.length})
            </h2>
            <ReviewsBox
              productId={p._id.toString()}
              initialReviews={JSON.parse(JSON.stringify(reviews))}
            />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
