import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Banner } from "@/models/Banner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import LibraryClient from "./LibraryClient";
import { fetchLibraryProducts } from "./actions";

export default async function LibraryPage() {
  await connectDB();

  const categories = await Product.distinct("category", { channel: "library" });

  const initial = await fetchLibraryProducts({});

  const banners = await Banner.find({
    isActive: true,
    link: "/library"
  }).lean();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {banners.length > 0 && (
          <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />
        )}

        <LibraryClient
          initialProducts={initial.products}
          initialTotalPages={initial.totalPages}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  );
}
