import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import AddToCartButton from "./ui/AddToCartButton";
import FavoriteButton from "./ui/FavoriteButton";
import ReviewsBox from "./ui/ReviewsBox";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params; // ✅ IMPORTANT sur Next.js 16

  await connectDB();
  const p = await Product.findById(id).lean();

  if (!p) {
    return <div>Produit introuvable.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border rounded p-3">
        <img
          src={p.imageUrl}
          alt={p.name}
          className="w-full h-[360px] object-cover rounded"
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>

        <p className="mt-2 text-brand-orange font-bold text-xl">
          {p.price} FCFA
        </p>

        <p className="mt-4 text-gray-700 whitespace-pre-wrap">
          {p.description}
        </p>

        <div className="mt-6 flex gap-3 flex-wrap">
          <AddToCartButton
            product={{
              productId: p._id.toString(),
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl
            }}
          />
          <FavoriteButton productId={p._id.toString()} />
        </div>

        <ReviewsBox productId={p._id.toString()} />
      </div>
    </div>
  );
}