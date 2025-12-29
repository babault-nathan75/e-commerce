import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Commandes (Admin)</h1>

      <div className="mt-4 space-y-3">
        {orders.map((o) => {
          const isGuest = !!o.guest?.email;

          return (
            <Link
              key={o._id.toString()}
              className="block border rounded p-3 hover:border-brand-orange"
              href={`/admin/orders/${o._id}`}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-bold">{o.orderCode}</div>
                  <div className="text-sm text-gray-700">
                    Statut: <strong>{o.status}</strong>
                    {o.canceledAt ? <span className="text-red-600"> • Annulée</span> : null}
                  </div>
                </div>

                <div className="text-sm text-gray-600 text-right">
                  <div>{new Date(o.createdAt).toLocaleString()}</div>
                  <div>
                    {o.totalItems} article(s) •{" "}
                    <strong className="text-brand-green">{o.totalPrice} FCFA</strong>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                Client:{" "}
                <strong>
                  {isGuest ? o.guest?.name : "Compte utilisateur"}
                </strong>{" "}
                {isGuest ? (
                  <span className="text-gray-600">({o.guest?.email})</span>
                ) : null}
              </div>
            </Link>
          );
        })}

        {orders.length === 0 ? <p className="text-gray-600">Aucune commande.</p> : null}
      </div>
    </div>
  );
}