// src/app/library/page.js
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import { fetchLibraryProducts } from "./actions"; 
import LibraryClient from "./LibraryClient"; 
import { BookOpen, Fingerprint } from "lucide-react";

export const metadata = {
  title: "Librairie chrétienne – Hebron Shops",
  description: "Indexation systématique de ressources littéraires et techniques chrétiennes."
};

export default async function LibraryPage() {
  await connectDB();

  // --- PERFORMANCE : Fetching Parallèle ---
  const [categories, initial, banners] = await Promise.all([
    Product.distinct("category", { channel: "library" }),
    fetchLibraryProducts({}), // Retourne { products, total, totalPages }
    Banner.find({ isActive: true, link: "/library" }).sort({ createdAt: -1 }).lean()
  ]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-500 pb-20">
        
        {/* --- HEADER TACTIQUE --- */}
        <div className="relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-4 border-emerald-500 pl-8 font-black uppercase">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                      <BookOpen size={16} />
                   </div>
                   <p className="text-[10px] text-emerald-600 dark:text-emerald-400 tracking-[0.4em]">Hebron-ivoire librairie</p>
                </div>
                <h1 className="text-2xl md:text-4xl tracking-tighter italic leading-none text-gray-900 dark:text-white">
                  Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Librairie</span>
                </h1>
                <p className="max-w-md text-[11px] font-medium text-gray-400 tracking-widest leading-relaxed">
                  Plongez dans notre collection d'ouvrages sélectionnés pour vous inspirer, vous former et vous divertir.
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                 <div className="bg-gray-900 dark:bg-white px-6 py-3 rounded-2xl shadow-2xl">
                    <p className="text-[11px] text-white dark:text-gray-900 tracking-[0.2em] italic">
                      {initial?.total || 0} Livres & Ressources
                    </p>
                 </div>
                 <div className="flex items-center gap-2 text-gray-400 mr-2">
                    <Fingerprint size={14} />
                    <span className="text-[9px] font-mono tracking-[0.3em]">Protocol V.26 / SECURED</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-15">
          {banners.length > 0 && (
            <div className="mb-16 relative z-20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 border-white dark:border-gray-900">
              <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />
            </div>
          )}

          {/* --- CORRECTION ICI : Mapping des props attendues par LibraryClient --- */}
          <LibraryClient 
            categories={categories} 
            initialProducts={initial?.products || []} 
            initialTotalPages={initial?.totalPages || 1}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}