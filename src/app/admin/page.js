import Link from "next/link";

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Admin Dashboard</h1>

      <div className="mt-4 grid gap-3">
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/products">
          Gérer les produits (CRUD)
        </Link>
        <div className="border rounded p-3 opacity-60">
          Gérer les commandes (à faire ensuite)
        </div>
        <div className="border rounded p-3 opacity-60">
          Gérer les utilisateurs (à faire ensuite)
        </div>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/orders">
            Gérer les commandes (statuts + fiches)
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/reviews">
          Gérer les reviews 
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/users">
          Gérer les utilisateurs (rôles)
        </Link>
      </div>
    </div>
  );
}