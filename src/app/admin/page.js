import Link from "next/link";

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Admin Dashboard</h1>

      <div className="mt-4 grid gap-3">
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/products">
          Gérer les produits (CRUD)
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/orders">
            Gérer les commandes (statuts + fiches)
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/reviews">
          Gérer les commentaires
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange" href="/admin/users">
          Gérer les utilisateurs (rôles)
        </Link>
        <Link className="border rounded p-3 hover:border-brand-orange w-20" href="/">
          Accueil
        </Link>
      </div>
    </div>
  );
}