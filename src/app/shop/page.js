import Link from "next/link";
import { ShoppingBag, Eye, Search, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner"; 
import BannerCarousel from "@/components/shop/BannerCarousel";

export const metadata = {
  title: "Boutique – my-ecommerce",
  description: "Achetez les meilleurs produits au meilleur prix sur my-ecommerce."
};

const PAGE_SIZE = 12;

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  
  const search = params.search || "";
  const category = params.category || "";
  const page = params.page || "1";

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  await connectDB();

  // 1. Récupérer les catégories uniques présentes en base
  const categories = await Product.distinct("category");

  const activeBanners = await Banner.find({ 
    isActive: true, 
    link: "/shop" 
  }).sort({ createdAt: -1 }).lean();

  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#eaeded] md:bg-white pb-10">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-8">

          {/* 🔍 BARRE DE RECHERCHE & FILTRES */}
          <div className="sticky top-0 z-20 bg-[#eaeded] md:bg-white pb-2 -mx-2 px-2 md:mx-0 md:px-0">
            <form method="GET" action="/shop" className="mb-3">
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Rechercher sur my-ecommerce..."
                  className="flex-1 outline-none px-4 py-3 text-sm"
                />
                {/* Garder la catégorie active lors d'une recherche */}
                {category && <input type="hidden" name="category" value={category} />}
                <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-5 py-3 transition-colors">
                  <Search className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            </form>

            {/* 🏷️ FILTRE PAR CATÉGORIES (Scroll horizontal) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <Link
                href="/shop"
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  !category 
                  ? "bg-[#37475a] text-white border-[#37475a]" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-800"
                }`}
              >
                Tout voir
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}${search ? `&search=${search}` : ""}`}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all uppercase tracking-wider ${
                    category === cat 
                    ? "bg-[#37475a] text-white border-[#37475a]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-800"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* 📢 BANNIÈRES DYNAMIQUES */}
          {!category && !search && (
             <BannerCarousel banners={JSON.parse(JSON.stringify(activeBanners))} />
          )}

          {/* Titre de section adaptatif */}
          <div className="flex items-center justify-between mb-4 px-1 mt-4">
            <h1 className="text-sm md:text-xl font-bold text-gray-800">
              {search ? `Résultats pour "${search}"` : category ? `Rayon ${category}` : "Nos meilleures sélections"}
            </h1>
            <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                {total} produits trouvés
            </span>
          </div>

          {/* 🛒 GRILLE DE PRODUITS */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {products.map((p) => (
                <Link
                  key={p._id.toString()}
                  href={`/product/${p._id}`}
                  className="group bg-white flex flex-col p-2 md:p-4 rounded-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square w-full mb-3 bg-[#f7f7f7] rounded-md overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <h2 className="text-[13px] md:text-sm font-medium text-gray-800 line-clamp-2 leading-tight h-8 md:h-10 mb-1">
                      {p.name}
                    </h2>
                    
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-[#ffa41c] text-[10px]">★</span>
                      ))}
                      <span className="text-[10px] text-blue-600 ml-1">{(Math.random() * 500).toFixed(0)}</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-start gap-0.5">
                        <span className="text-[10px] font-bold mt-1 uppercase text-gray-500">FCFA</span>
                        <span className="text-lg md:text-2xl font-bold text-gray-900">
                          {p.price.toLocaleString()}
                        </span>
                      </div>
                      {/* Badge Stock (Optionnel) */}
                      <p className="text-[10px] text-green-700 font-bold mt-1">En stock</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Aucun produit dans cette catégorie.</p>
              <Link href="/shop" className="text-blue-600 text-sm mt-2 inline-block font-bold">Voir tout le catalogue</Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2 flex-wrap">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?page=${i + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                    currentPage === i + 1
                      ? "bg-[#37475a] text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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