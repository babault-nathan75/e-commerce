import Link from "next/link";
import { Search, Flame, PackageOpen, Zap, ShoppingCart } from "lucide-react";
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

// --- Moteur de Style Hebron ---
const CHIP_BASE = "flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border";
const CHIP_ACTIVE = `
  ${CHIP_BASE} 
  bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/20 
  dark:bg-white dark:text-gray-900 dark:border-white
`;
const CHIP_INACTIVE = `
  ${CHIP_BASE} 
  bg-white text-gray-400 border-gray-100 hover:border-orange-500 hover:text-orange-500 
  dark:bg-gray-900 dark:text-gray-500 dark:border-gray-800 dark:hover:border-orange-400
`;

// Formatage monétaire unifié
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
});

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  const [categories, activeBanners] = await Promise.all([
    Product.distinct("category", { channel: "shop" }),
    Banner.find({ isActive: true, link: "/shop" }).sort({ createdAt: -1 }).lean()
  ]);

  const query = { channel: "shop" };
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;

  const [productsRaw, total] = await Promise.all([
    Product.find(query)
      .sort({ stockAvailable: -1, createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pb-20 transition-colors duration-500">
        
        {/* --- NAVIGATION TACTIQUE --- */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            
            <form method="GET" action="/shop" className="relative group max-w-3xl mx-auto">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="RECHERCHER DANS L'INVENTAIRE..."
                className="
                  block w-full pl-14 pr-4 py-4
                  bg-gray-50 dark:bg-gray-900 
                  border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-orange-500/5
                  rounded-2xl text-[11px] font-black uppercase tracking-widest
                  text-gray-900 dark:text-gray-100 placeholder-gray-400
                  transition-all duration-300 shadow-inner
                "
              />
            </form>

            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
              <Link href="/shop" className={!category ? CHIP_ACTIVE : CHIP_INACTIVE}>TOUT VOIR</Link>
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

        <div className="max-w-7xl mx-auto px-4 py-10">
          
          {!category && !search && activeBanners.length > 0 && (
            <div className="mb-14 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-500/10 border border-white dark:border-gray-900">
               <BannerCarousel banners={JSON.parse(JSON.stringify(activeBanners))} />
            </div>
          )}

          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-l-4 border-orange-500 pl-6">
            <div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Hebron Inventory</p>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                {search ? `Query: ${search}` : category ? category : "Nos Articles"}
              </h1>
            </div>
            <div className="bg-gray-900 dark:bg-white px-4 py-2 rounded-xl">
               <p className="text-[10px] font-black text-white dark:text-gray-900 uppercase tracking-widest">
                 {total} Unités détectées
               </p>
            </div>
          </div>

          {/* --- GRID PRODUITS --- */}
          {productsRaw.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {productsRaw.map((p) => {
                const realStock = p.stockAvailable ?? p.stock ?? 0;
                const isOutOfStock = realStock <= 0;
                const lowStock = realStock > 0 && realStock <= 5;
                const isNew = new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                return (
                  <Link
                    key={p._id.toString()}
                    href={`/product/${p._id}`}
                    className={`
                      group relative flex flex-col 
                      bg-white dark:bg-gray-900 
                      rounded-[2rem] border border-gray-100 dark:border-gray-800
                      overflow-hidden transition-all duration-500
                      ${isOutOfStock ? 'opacity-60' : 'hover:-translate-y-3 hover:shadow-3xl hover:shadow-orange-500/20'}
                    `}
                  >
                    {/* Badges Flottants */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {isNew && !isOutOfStock && (
                        <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
                          <Zap size={10} fill="currentColor" /> Nouveau
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      {isOutOfStock ? (
                        <div className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">Épuisé</div>
                      ) : lowStock ? (
                        <div className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest animate-pulse flex items-center gap-1">
                          <Flame size={10} fill="currentColor" /> Vite !
                        </div>
                      ) : null}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[4/5] w-full bg-[#f9fafb] dark:bg-gray-800/50 p-8 flex items-center justify-center overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      {!isOutOfStock && (
                        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                           <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl">
                              <ShoppingCart size={18} />
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h2 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-100 line-clamp-2 uppercase tracking-tight mb-4 group-hover:text-orange-500 transition-colors">
                        {p.name}
                      </h2>
                      
                      <div className="mt-auto space-y-5">
                        <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">
                          {currencyFormatter.format(p.price)}
                        </div>

                        {/* Barre de Stock Prestige */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.1em]">
                            <span className={isOutOfStock ? "text-rose-500" : lowStock ? "text-orange-500" : "text-emerald-500"}>
                              {isOutOfStock ? "Rupture de flux" : lowStock ? "Stock Critique" : "Disponible"}
                            </span>
                            {!isOutOfStock && <span className="text-gray-400 font-mono">{realStock} U.</span>}
                          </div>
                          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            {!isOutOfStock && (
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${lowStock ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min((realStock / 15) * 100, 100)}%` }}
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
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <PackageOpen size={64} className="text-gray-200 dark:text-gray-800 mb-6" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Aucun résultat</h3>
              <p className="text-gray-400 text-sm mt-2 mb-10">L'inventaire ne contient pas cette référence.</p>
              <Link href="/shop" className="px-10 py-4 bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-colors">
                Réinitialiser les filtres
              </Link>
            </div>
          )}

          {/* --- PAGINATION --- */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center gap-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?page=${i + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all
                    ${page === i + 1 
                      ? "bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-110" 
                      : "bg-white dark:bg-gray-900 text-gray-400 hover:text-orange-500 border border-gray-100 dark:border-gray-800"
                    }
                  `}
                >
                  {String(i + 1).padStart(2, '0')}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}