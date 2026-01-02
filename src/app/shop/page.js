import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export const metadata = {
  title: "Boutique – my-ecommerce",
  description:
    "Achetez les meilleurs produits au meilleur prix sur my-ecommerce."
};

const PAGE_SIZE = 9;

export default async function ShopPage({ searchParams }) {
  const {
    search = "",
    min = "",
    max = "",
    sort = "",
    page = "1",
    category = ""
  } = searchParams;

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  await connectDB();

  /* ===============================
     CONSTRUCTION DE LA REQUÊTE
  =============================== */
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (min || max) {
    query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);
  }

  let sortQuery = { createdAt: -1 };
  if (sort === "price_asc") sortQuery = { price: 1 };
  if (sort === "price_desc") sortQuery = { price: -1 };

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const categories = await Product.distinct("category");

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-green">
              Boutique
            </h1>
          </div>

          {/* Produits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p._id}`}
                className="group rounded-2xl bg-white border shadow-sm hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-56 bg-white flex items-center justify-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-4">
                  <h2 className="font-semibold line-clamp-2">
                    {p.name}
                  </h2>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-brand-orange">
                      {p.price} FCFA
                    </span>
                    <Eye className="w-4 h-4 text-brand-green" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/shop?page=${i + 1}`}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentPage === i + 1
                      ? "bg-brand-green text-white"
                      : "bg-white border hover:bg-gray-100"
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
