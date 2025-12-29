import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-green">Bienvenue sur my-ecommerce</h1>
      <div className="flex gap-3">
        <Link className="px-4 py-2 rounded bg-brand-orange text-white" href="/shop">
          Boutique
        </Link>
        <Link className="px-4 py-2 rounded bg-brand-green text-white" href="/library">
          Librairie
        </Link>
      </div>
    </div>
  );
}