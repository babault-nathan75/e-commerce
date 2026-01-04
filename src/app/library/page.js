import Link from "next/link";
import { BookOpen, Eye } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export const metadata = {
  title: "Librairie – my-ecommerce",
  description: "Découvrez notre librairie sur my-ecommerce."
};

export default async function LibraryPage() {
  await connectDB();

  // On ne récupère QUE les produits de la librairie
  const products = await Product.find({ channel: "library" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* ===== BANNIÈRE ===== */}
          <div className="mb-10 rounded-3xl bg-gradient-to-r from-brand-green to-yellow-400 text-white p-10 shadow-lg">
            <h2 className="text-3xl font-extrabold">
              📚 Librairie my-ecommerce
            </h2>
            <p className="mt-2 text-lg">
              Livres, documents et ressources sélectionnés pour vous
            </p>
          </div>

          {/* ===== HEADER PAGE ===== */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-green-100 text-brand-green">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-green">
              Librairie
            </h1>
          </div>

          {/* ===== PRODUITS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p._id}`}
                className="
                  group rounded-2xl bg-white
                  border border-gray-100
                  shadow-sm
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300
                  overflow-hidden
                "
              >
                {/* Image uniforme */}
                <div className="h-56 bg-gray-100 flex items-center justify-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                  />
                </div>

                {/* Infos */}
                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-gray-800 line-clamp-2">
                    {p.name}
                  </h2>

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-brand-orange text-lg">
                      {p.price} FCFA
                    </span>
                    <Eye className="w-4 h-4 text-brand-green" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ===== EMPTY STATE ===== */}
          {products.length === 0 && (
            <div className="mt-16 text-center text-gray-500">
              Aucun livre disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
