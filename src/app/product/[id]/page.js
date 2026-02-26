import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review"; 
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddToCartButton from "./ui/AddToCartButton";
import FavoriteButton from "./ui/FavoriteButton";
import ReviewsBox from "./ui/ReviewsBox";
import StarRating from "@/components/ui/StarRating";
import { 
  Box, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  Share2
} from "lucide-react";
import Link from "next/link";

async function getReviews(productId) {
  try {
    await connectDB();
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    return reviews || [];
  } catch (error) {
    console.error("Erreur avis:", error);
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
        <div className="py-40 text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-black text-gray-900">Produit introuvable</h2>
          <Link href="/shop" className="text-orange-500 font-bold underline">Retourner à la boutique</Link>
        </div>
      </DashboardLayout>
    );
  }

  const reviews = await getReviews(id);
  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // ✅ 1. CALCUL DU STOCK SÉCURISÉ
  // On vérifie stockAvailable ET stock pour être sûr de ne rien rater
  const stockQty = Number(p.stockAvailable ?? p.stock ?? 0);
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        
        {/* --- NAVIGATION / BREADCRUMB --- */}
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Retour au catalogue
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Share2 size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
              
              {/* COLONNE GAUCHE : IMAGE (Lg: 7/12) */}
            <div className="lg:col-span-7">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center group">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className={`
                    max-h-[85%] max-w-[85%] object-contain transition-all duration-700 group-hover:scale-110
                    ${isOutOfStock ? "grayscale opacity-50" : ""}
                  `}
                />
                
                {/* Overlay Stock Epuisé */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white/90 px-6 py-2 rounded-full text-black font-black uppercase tracking-widest shadow-xl">
                      Momentanément épuisé
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLONNE DROITE : INFOS (Lg: 5/12) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              
              {/* Badge Catégorie / Statut */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                    isOutOfStock
                      ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                      : isLowStock
                      ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 animate-pulse"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                  }`}
                >
                  {isOutOfStock ? <AlertTriangle size={12} /> : isLowStock ? <Box size={12} /> : <CheckCircle2 size={12} />}
                  {isOutOfStock ? "Epuisé" : isLowStock ? `Plus que ${stockQty} en stock` : "En stock"}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                {p.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <StarRating value={avg} size={18} />
                <span className="text-sm font-bold text-gray-400">({reviews.length} avis clients)</span>
              </div>

              <div className="text-4xl font-black text-orange-500 mb-8">
                {p.price.toLocaleString()} <span className="text-lg font-medium">FCFA</span>
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none mb-10">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg italic border-l-4 border-orange-500 pl-4 bg-gray-50 dark:bg-gray-900 py-4 rounded-r-xl">
                  {p.description}
                </p>
              </div>

              {/* ACTIONS BOUTONS */}
              <div className="space-y-4 mb-10">
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  <div className="flex-1">
                    {/* ✅ 2. MODIFICATION ICI : On passe 'disabled' et 'stockAvailable' */}
                    <AddToCartButton
                      disabled={isOutOfStock}
                      product={{
                        productId: p._id.toString(),
                        name: p.name,
                        price: p.price,
                        imageUrl: p.imageUrl,
                        stockAvailable: stockQty // CRUCIAL pour le blocage dans le panier
                      }}
                    />
                  </div>
                  <FavoriteButton productId={p._id.toString()} />
                </div>
              </div>

              {/* TRUST ELEMENTS */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-gray-900 dark:text-white">Livraison Express</p>
                    <p className="text-[10px] text-gray-500">24h à 48h sur Abidjan</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-gray-900 dark:text-white">Qualité Garantie</p>
                    <p className="text-[10px] text-gray-500">Produit 100% authentique</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION AVIS / REVIEWS */}
          <div className="mt-24 pt-16 border-t border-gray-100 dark:border-gray-800">
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