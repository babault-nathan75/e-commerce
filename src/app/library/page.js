import Link from "next/link";
import { BookOpen, Search, Eye } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner"; // Import du modèle Banner
import BannerCarousel from "@/components/shop/BannerCarousel"; // Réutilisation du composant

export const metadata = {
  title: "Librairie – my-ecommerce",
  description: "Découvrez notre librairie sur my-ecommerce."
};

export default async function LibraryPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || "";

  await connectDB();

  // 1. RÉCUPÉRATION DES BANNIÈRES (Filtrées pour la librairie)
  // On récupère les bannières actives dont le lien pointe vers /library
  const activeBanners = await Banner.find({ 
    isActive: true, 
    link: "/library" 
  }).sort({ createdAt: -1 }).lean();

  // 2. RÉCUPÉRATION DES PRODUITS
  const query = { channel: "library" };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DashboardLayout>
      {/* Fond gris Amazon sur mobile */}
      <div className="min-h-screen bg-[#eaeded] md:bg-white pb-10">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-4">

          {/* 🔍 RECHERCHE STYLE AMAZON */}
          <form method="GET" action="/library" className="mb-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Rechercher un livre..."
                className="flex-1 outline-none px-4 py-3 text-sm"
              />
              <button type="submit" className="bg-[#febd69] px-5 py-3">
                <Search className="w-5 h-5 text-gray-800" />
              </button>
            </div>
          </form>

          {/* 📢 BANNIÈRES DYNAMIQUES (Identique au Shop) */}
          {activeBanners.length > 0 && (
            <div className="w-full mb-6">
              <BannerCarousel banners={JSON.parse(JSON.stringify(activeBanners))} />
            </div>
          )}

          {/* Titre de section */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 uppercase">
              {search ? `Résultats pour "${search}"` : "Librairie"}
            </h1>
          </div>

          {/* 🛒 GRILLE DE PRODUITS (2 colonnes Mobile) */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {products.map((p) => (
                <Link
                  key={p._id.toString()}
                  href={`/product/${p._id}`}
                  className="group bg-white flex flex-col p-2 md:p-4 rounded-sm border-[0.5px] border-gray-200 shadow-sm"
                >
                  {/* Image Format Livre */}
                  <div className="aspect-[3/4] w-full mb-3 bg-[#f7f7f7] rounded-sm overflow-hidden flex items-center justify-center p-2">
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
                    
                    <div className="flex items-center gap-0.5 mb-2 text-[#ffa41c]">
                      {[...Array(5)].map((_, i) => <span key={i} className="text-[10px]">★</span>)}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-start gap-0.5">
                        <span className="text-[10px] font-bold mt-1">FCFA</span>
                        <span className="text-lg md:text-2xl font-bold text-gray-900">
                          {p.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#007600] font-bold mt-1 italic">Disponible</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Aucun ouvrage trouvé.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}