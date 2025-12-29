import Link from "next/link";

async function getAllProducts() {
  const res = await fetch("http://localhost:3000/api/products", { cache: "no-store" });
  return res.json();
}

export default async function AdminProductsPage() {
  const data = await getAllProducts();
  const products = data.products || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Produits</h1>
        <Link className="px-4 py-2 rounded bg-brand-orange text-white" href="/admin/products/new">
          + Nouveau
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {products.map((p) => (
          <div key={p._id} className="border rounded p-3 flex items-center gap-3">
            <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">
                {p.channel === "shop" ? "Boutique" : "Librairie"} • {p.price} FCFA
              </div>
            </div>

            <Link className="underline text-brand-green" href={`/admin/products/${p._id}/edit`}>
              Modifier
            </Link>
          </div>
        ))}

        {products.length === 0 ? <p className="text-gray-600">Aucun produit.</p> : null}
      </div>
    </div>
  );
}