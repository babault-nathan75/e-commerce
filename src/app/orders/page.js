import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Mes commandes</h1>
        <p className="mt-3">Tu dois être connecté.</p>
        <Link className="underline text-brand-orange" href="/login">Connexion</Link>
      </div>
    );
  }

  await connectDB();
  const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Mes commandes</h1>

      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <Link
            key={o._id.toString()}
            className="block border rounded p-3 hover:border-brand-orange"
            href={`/orders/${o._id}`}
          >
            <div className="flex justify-between">
              <strong>Code: {o.orderCode}</strong>
              <span className="text-sm">{new Date(o.createdAt).toLocaleString()}</span>
            </div>

            <div className="mt-1 text-sm text-gray-700">
              Statut: <strong>{o.status}</strong>
              {o.canceledAt ? <span className="text-red-600"> • Annulée</span> : null}
            </div>

            <div className="mt-1 text-sm">
              Articles: {o.totalItems} • Total: <strong className="text-brand-green">{o.totalPrice} FCFA</strong>
            </div>
          </Link>
        ))}

        {orders.length === 0 ? <p className="text-gray-600">Aucune commande.</p> : null}
      </div>
    </div>
  );
}