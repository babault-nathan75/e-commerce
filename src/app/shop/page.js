import Link from "next/link";
import { Search, AlertTriangle, CheckCircle2, Flame, PackageOpen } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner"; 
import BannerCarousel from "@/components/shop/BannerCarousel";

export const metadata = {
  title: "Boutique – Hebron Ivoire Shops",
  description: "Découvrez nos produits en stock au meilleur prix."
};

const PAGE_SIZE = 12;

// --- Styles Unifiés ---
const CHIP_BASE = "flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 border";
const CHIP_ACTIVE = `
  ${CHIP_BASE} 
  bg-gray-900 text-white border-gray-900 shadow-md 
  dark:bg-white dark:text-gray-900 dark:border-white dark:shadow-white/10
`;
const CHIP_INACTIVE = `
  ${CHIP_BASE} 
  bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500 
  dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:border-orange-400 dark:hover:text-orange-400
`;

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
      .sort({ stock: -1, createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
        
        {/* --- HEADER & FILTRES (STICKY) --- */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            
            {/* Barre de recherche */}
            <form method="GET" action="/shop" className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Rechercher un produit..."
                className="
                  block w-full pl-11 pr-4 py-3 
                  bg-gray-100 dark:bg-gray-900 
                  border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-black focus:ring-0 
                  rounded-xl text-sm 
                  text-gray-900 dark:text-gray-100 placeholder-gray-500
                  transition-all duration-300
                  shadow-inner
                "
              />
              {category && <input type="hidden" name="category" value={category} />}
            </form>

            {/* Catégories (Chips) */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
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
        </div>

        {/* --- CONTENU PRINCIPAL --- */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Bannières */}
          {!category && !search && activeBanners.length > 0 && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 dark:shadow-none">
               <BannerCarousel banners={JSON.parse(JSON.stringify(activeBanners))} />
            </div>
          )}

          {/* Titre Section */}
          <div className="flex items-end justify-between mb-8 px-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {search ? (
                   <span>Résultats pour "<span className="text-orange-500">{search}</span>"</span>
                ) : category ? (
                   category
                ) : (
                   <span>Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Articles</span></span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {total} référence{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* --- GRID PRODUITS --- */}
          {productsRaw.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {productsRaw.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const lowStock = p.stock > 0 && p.stock <= 5;
                const stockPercent = Math.min((p.stock / 20) * 100, 100);

                return (
                  <Link
                    key={p._id.toString()}
                    href={`/product/${p._id}`}
                    className={`
                      group relative flex flex-col 
                      bg-white dark:bg-gray-800 
                      rounded-2xl border border-gray-100 dark:border-gray-700
                      overflow-hidden
                      transition-all duration-500
                      ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : 'hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-black/50'}
                    `}
                  >
                    {/* Badge Stock Flottant (Top Right) */}
                    {isOutOfStock && (
                      <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-lg">
                        Épuisé
                      </div>
                    )}
                    {lowStock && !isOutOfStock && (
                       <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-lg flex items-center gap-1">
                         <Flame size={10} className="fill-white" /> -{p.stock}
                       </div>
                    )}

                    {/* Image Container */}
                    <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-700/50 p-6 flex items-center justify-center overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="
                          w-full h-full object-contain 
                          mix-blend-multiply dark:mix-blend-normal 
                          transition-transform duration-700 ease-out group-hover:scale-110
                        "
                      />
                    </div>

                    {/* Contenu */}
                    <div className="p-5 flex flex-col flex-1">
                      
                      {/* Titre */}
                      <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-3 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                        {p.name}
                      </h2>
                      
                      <div className="mt-auto space-y-4">
                        {/* Prix */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {p.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">FCFA</span>
                        </div>

                        {/* Barre de Stock */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                            <span className={isOutOfStock ? "text-red-500" : lowStock ? "text-orange-500" : "text-green-600 dark:text-green-400"}>
                              {isOutOfStock ? "Indisponible" : lowStock ? "Vite !" : "En stock"}
                            </span>
                            {!isOutOfStock && (
                              <span className="text-gray-400 dark:text-gray-600 font-mono">{p.stock} pces</span>
                            )}
                          </div>
                          
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                             {!isOutOfStock && (
                               <div 
                                 className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                   lowStock ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-600'
                                 }`}
                                 style={{ width: `${stockPercent}%` }}
                               />
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            // État Vide
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                <PackageOpen size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                Nous n'avons pas trouvé ce que vous cherchez. Essayez une autre catégorie ou un autre terme.
              </p>
              <Link 
                href="/shop" 
                className="
                  px-8 py-3 rounded-xl
                  bg-gray-900 dark:bg-white 
                  text-white dark:text-gray-900 
                  font-bold text-sm hover:scale-105 transition-transform
                "
              >
                Tout effacer
              </Link>
            </div>
          )}

          {/* --- PAGINATION STYLISÉE --- */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?page=${i + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300
                    ${page === i + 1 
                      ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-110" 
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 dark:hover:border-orange-400 hover:text-orange-500"
                    }
                  `}
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