import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Package, BookOpen, Store, ArrowLeft } from "lucide-react";

export default async function AdminProductsPage({ searchParams }) {
  // ✅ Next.js App Router : searchParams est async
  const params = await searchParams;
  const channel = params.channel || "";
  const category = params.category || "";

  // ✅ Connexion DB AVANT toute requête
  await connectDB();

  // ✅ Construction de la requête dynamique
  const query = {};
  if (channel) query.channel = channel;
  if (category) query.category = category;

  // ✅ UNE SEULE requête products
  const products = await Product.find(query)
    .sort({ stockAvailable: 1, createdAt: -1 }) // stock faible en priorité
    .lean();
    console.log("DEBUG PRODUCTS:", products);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-brand-green flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="capitalize">{channel || "Tous les produits"}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            {channel === "library" ? (
              <BookOpen className="text-blue-600" />
            ) : (
              <Store className="text-brand-green" />
            )}
            {category ? category : "Inventaire Global"}
            <span className="text-sm font-normal text-gray-400">
              ({products.length})
            </span>
          </h1>
        </div>

        <Link
          className="bg-brand-orange hover:bg-orange-600 hover:text-white border border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all text-center"
          href="/admin/products/new"
        >
          + Nouveau Produit
        </Link>
      </div>

      {/* LISTE */}
      <div className="space-y-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div
              key={p._id.toString()}
              className="bg-white border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              {/* IMAGE */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* INFOS */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      p.channel === "library"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.channel === "library" ? "Livre" : "Shop"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {p.category?.[0] || "Sans catégorie"}
                  </span>
                </div>
                <h2 className="font-bold text-gray-800 truncate group-hover:text-brand-green">
                  {p.name}
                </h2>
                <p className="text-brand-orange font-black text-sm">
                  {p.price.toLocaleString()}{" "}
                  <span className="text-[10px]">FCFA</span>
                </p>
              </div>

              {/* STOCK – VALEUR NUMÉRIQUE STRICTE */}
                <div className="min-w-[60px] text-gray-700 bg-gray-100 font-mono font-bold text-sm">
                  {p.stockAvailable}
                </div>

              {/* ACTION */}
              <Link
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                href={`/admin/products/${p._id}/edit`}
              >
                Modifier
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Aucun produit trouvé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
