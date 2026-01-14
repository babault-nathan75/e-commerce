import Link from "next/link";
import { Search, AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner"; 
import BannerCarousel from "@/components/shop/BannerCarousel";

export const metadata = {
  title: "Boutique – my-ecommerce",
  description: "Découvrez nos produits en stock au meilleur prix."
};

const PAGE_SIZE = 12;

// --- Styles réutilisables ---
const CHIP_BASE = "flex-shrink-0 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all";
const CHIP_ACTIVE = `${CHIP_BASE} bg-black text-white border-black shadow-lg shadow-gray-200`;
const CHIP_INACTIVE = `${CHIP_BASE} bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900`;

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  // Récupération des données en parallèle
  const [categories, activeBanners] = await Promise.all([
    Product.distinct("category", { channel: "shop" }),
    Banner.find({ isActive: true, link: "/shop" }).sort({ createdAt: -1 }).lean()
  ]);

  const query = { channel: "shop" };
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;

  const [productsRaw, total] = await Promise.all([
    Product.find(query)
      .sort({ stock: -1, createdAt: -1 }) // Disponible d'abord
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f9fa] md:bg-white pb-10">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-8">

          {/* 🔍 RECHERCHE & FILTRES */}
          <div className="sticky top-0 z-20 bg-[#f8f9fa] md:bg-white pb-3 -mx-2 px-2 md:mx-0 md:px-0 border-b border-gray-100 mb-4">
            <form method="GET" action="/shop" className="mb-3">
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:border-orange-400 transition-all">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Rechercher un article..."
                  className="flex-1 outline-none px-4 py-3 text-sm md:text-base"
                />
                {category && <input type="hidden" name="category" value={category} />}
                <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-6 py-3 transition-colors">
                  <Search className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Link href="/shop" className={!category ? CHIP_ACTIVE : CHIP_INACTIVE}>
                Tout voir
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}${search ? `&search=${search}` : ""}`}
                  className={category === cat ? CHIP_ACTIVE : CHIP_INACTIVE}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {!category && !search && activeBanners.length > 0 && (
             <BannerCarousel banners={JSON.parse(JSON.stringify(activeBanners))} />
          )}

          <div className="flex items-end justify-between mb-6 mt-6">
            <h1 className="text-lg md:text-2xl font-black text-gray-900">
              {search ? `Résultats : ${search}` : category ? category : "Nouveautés"}
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{total} produits</p>
          </div>

          {/* 🛒 GRILLE DE PRODUITS */}
          {productsRaw.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {productsRaw.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const lowStock = p.stock > 0 && p.stock <= 5;
                // Calcul du pourcentage de la barre (max visuel à 20 articles)
                const stockPercent = Math.min((p.stock / 20) * 100, 100);

                return (
                  <Link
                    key={p._id.toString()}
                    href={`/product/${p._id}`}
                    className={`group bg-white flex flex-col p-2 md:p-4 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 ${isOutOfStock ? 'opacity-60' : 'hover:-translate-y-1'}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className={`max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                          <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl">Épuisé</span>
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex flex-col flex-1">
                      <h2 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-orange-600 transition-colors">
                        {p.name}
                      </h2>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg md:text-2xl font-black text-gray-900">
                            {p.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">FCFA</span>
                        </div>

                        {/* --- SECTION STOCK DÉTAILLÉE --- */}
                          <div className="mt-auto space-y-2">
                            {isOutOfStock ? (
                              // État : Épuisé
                              <div className="flex items-center gap-1.5 text-red-500 bg-red-50 py-1.5 px-2 rounded-lg border border-red-100">
                                <AlertTriangle size={12} strokeWidth={3} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Victime de son succès</span>
                              </div>
                            ) : (
                              // État : En stock
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                  <span className={`flex items-center gap-1 ${lowStock ? "text-orange-600" : "text-emerald-600"}`}>
                                    {/* Icône animée si stock faible */}
                                    {lowStock ? (
                                      <Flame size={10} className="animate-bounce fill-orange-500" />
                                    ) : (
                                      <CheckCircle2 size={10} strokeWidth={3} />
                                    )}
                                    {lowStock ? "Bientôt épuisé" : "En stock"}
                                  </span>
                                  <span className="text-gray-400 font-mono">{p.stock} dispos</span>
                                </div>
                                
                                {/* Barre de progression visuelle */}
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                      lowStock ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic">Aucun article trouvé...</p>
              <Link href="/shop" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-black transition hover:bg-orange-500">Réinitialiser</Link>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?page=${i + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${
                    page === i + 1 ? "bg-orange-400 text-white shadow-lg shadow-orange-100" : "bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}