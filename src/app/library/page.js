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
        <div className="max-w-7xl mx-auto px-4  -mt-1">
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