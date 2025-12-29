import Link from "next/link";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products?channel=library", { cache: "no-store" });
  return res.json();
}

export default async function LibraryPage() {
  const data = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Librairie</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.products?.map((p) => (
          <Link key={p._id} href={`/product/${p._id}`} className="border rounded p-3 hover:border-brand-orange">
            <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover rounded" />
            <div className="mt-2 font-semibold">{p.name}</div>
            <div className="text-brand-orange font-bold">{p.price} FCFA</div>
          </Link>
        ))}
      </div>
    </div>
  );
}