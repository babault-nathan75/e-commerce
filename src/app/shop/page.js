import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";

async function getProducts() {
  const res = await fetch(
    "http://localhost:3000/api/products?channel=shop",
    { cache: "no-store" }
  );
  return res.json();
}

export default async function ShopPage() {
  const data = await getProducts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-green">
            Boutique
          </h1>
        </div>

        {/* Grid produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.products?.map((p) => (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className="
                group relative
                rounded-2xl bg-white
                border border-gray-100
                shadow-sm
                hover:shadow-xl hover:-translate-y-1
                transition-all duration-300
                overflow-hidden
              "
            >
              {/* Image — taille uniforme */}
              <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay icon */}
                <div
                  className="
                    absolute inset-0
                    flex items-center justify-center
                    bg-black/0 group-hover:bg-black/30
                    opacity-0 group-hover:opacity-100
                    transition
                  "
                >
                  <div className="p-3 rounded-full bg-white/90 text-brand-green">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-gray-800 line-clamp-2">
                  {p.name}
                </h2>

                <div className="flex items-center justify-between">
                  <span className="text-brand-orange font-extrabold text-lg">
                    {p.price} FCFA
                  </span>

                  <span
                    className="
                      text-sm font-medium
                      text-brand-green
                      group-hover:underline
                    "
                  >
                    Voir →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {!data.products?.length && (
          <div className="mt-16 text-center text-gray-500">
            Aucun produit disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
