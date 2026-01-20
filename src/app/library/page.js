import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import LibraryClient from "./LibraryClient";
import { fetchLibraryProducts } from "./actions";
import { BookOpen, Sparkles } from "lucide-react";

export const metadata = {
  title: "Librairie – Hebron Ivoire Shops",
  description: "Explorez notre collection de livres, documents et ressources."
};

export default async function LibraryPage() {
  await connectDB();

  // Récupération des données
  const categories = await Product.distinct("category", { channel: "library" });
  const initial = await fetchLibraryProducts({});
  const banners = await Banner.find({
    isActive: true,
    link: "/library"
  }).lean();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
        
        {/* --- HEADER DE SECTION --- */}
        <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Titre et Sous-titre */}
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
                  <BookOpen size={14} />
                  <span>Espace Culture & Savoir</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Librairie</span>
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Plongez dans notre collection d'ouvrages sélectionnés pour vous inspirer, vous former et vous divertir.
                </p>
              </div>

              {/* Décoration visuelle (Icone géante floue) */}
              <div className="hidden md:block opacity-10 dark:opacity-5 transform rotate-12">
                <BookOpen size={150} className="text-green-600 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENU PRINCIPAL --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          
          {/* Section Bannières (Superposée légèrement sur le header si présent) */}
          {banners.length > 0 && (
            <div className="mb-12 relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10 dark:shadow-black/50 border border-gray-100 dark:border-gray-800">
              <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />
            </div>
          )}

          {/* Client Component (Liste des livres + Filtres) */}
          {/* Note: Assurez-vous que LibraryClient gère aussi le Dark Mode pour les cartes livres */}
          <div className="relative z-0">
             <LibraryClient
                initialProducts={initial.products}
                initialTotalPages={initial.totalPages}
                categories={categories}
              />
          </div>

          {/* Footer de section (Optionnel : Citation ou encouragement) */}
          <div className="mt-20 text-center opacity-60">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 mb-4">
              <Sparkles size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-500">
              "La lecture est une amitié." — Marcel Proust
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}