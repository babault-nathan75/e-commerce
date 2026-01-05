import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-10">
          <h1 className="text-3xl font-bold text-brand-green">Mes commandes</h1>
          <p className="mt-4 text-gray-700">Tu dois être connecté pour voir tes commandes.</p>
          <Link
            href="/login"
            className="inline-block mt-4 px-4 py-2 rounded bg-brand-orange text-white font-semibold"
          >
            Connexion
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  await connectDB();
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-brand-green mb-6">
          Mes commandes
        </h1>

        {orders.length === 0 && (
          <p className="text-gray-600">Aucune commande pour le moment.</p>
        )}

        <div className="grid gap-4">
          {orders.map((o) => (
            <Link
              key={o._id.toString()}
              href={`/orders/${o._id}`}
              className="
                block rounded-xl border bg-white p-5 shadow-sm
                hover:border-brand-orange hover:shadow-md transition
              "
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">
                    {o.orderCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm">
                    Statut :{" "}
                    <span className="font-semibold text-brand-green">
                      {o.status}
                    </span>
                  </div>
                  {o.canceledAt && (
                    <div className="text-sm text-red-600">
                      Annulée
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span>Articles : {o.totalItems}</span>
                <strong className="text-brand-orange">
                  {o.totalPrice} FCFA
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
