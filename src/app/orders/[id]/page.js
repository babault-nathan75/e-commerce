import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import CancelOrderBox from "./ui/CancelOrderBox";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="py-10 text-center">Connexion requise.</div>
      </DashboardLayout>
    );
  }

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-10 text-center">Commande introuvable.</div>
      </DashboardLayout>
    );
  }

  const isOwner = order.userId?.toString() === session.user.id;
  const isAdmin = !!session.user.isAdmin;
  if (!isAdmin && !isOwner) {
    return (
      <DashboardLayout>
        <div className="py-10 text-center">Accès interdit.</div>
      </DashboardLayout>
    );
  }

  const canCancel = !order.canceledAt && order.status !== "LIVRER";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-brand-green mb-6">
          Détail de la commande
        </h1>

        {/* INFOS */}
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-2">
          <div><strong>Code :</strong> {order.orderCode}</div>
          <div><strong>Date & heure :</strong> {new Date(order.createdAt).toLocaleString()}</div>
          <div>
            <strong>Statut :</strong>{" "}
            <span className="text-brand-green font-semibold">
              {order.status}
            </span>
          </div>
          <div><strong>Total articles :</strong> {order.totalItems}</div>
          <div>
            <strong>Total :</strong>{" "}
            <span className="text-brand-orange font-bold">
              {order.totalPrice} FCFA
            </span>
          </div>
          <div><strong>Contact :</strong> {order.contactPhone}</div>
          <div><strong>Adresse :</strong> {order.deliveryAddress}</div>

          {order.canceledAt && (
            <div className="mt-2 text-red-600">
              <strong>Annulée le :</strong>{" "}
              {new Date(order.canceledAt).toLocaleString()} <br />
              <strong>Raison :</strong> {order.cancelReason}
            </div>
          )}
        </div>

        {/* ARTICLES */}
        <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
  <h2 className="font-semibold mb-4 text-lg">Articles</h2>

  <div className="space-y-4">
    {order.items.map((it, idx) => (
      <div
        key={idx}
        className="
          flex items-center gap-4
          border rounded-xl p-4
          hover:border-brand-orange transition
        "
      >
        {/* IMAGE PRODUIT */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {it.imageUrl ? (
            <img
              src={it.imageUrl}
              alt={it.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              Image
            </div>
          )}
        </div>

        {/* INFOS PRODUIT */}
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {it.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Quantité : <strong>{it.quantity}</strong>
          </div>
          <div className="text-sm text-gray-600">
            Prix unitaire : {it.price} FCFA
          </div>
        </div>

        {/* TOTAL LIGNE */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Sous-total</div>
          <div className="font-bold text-brand-green text-lg">
            {it.quantity * it.price} FCFA
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* ANNULATION */}
        <div className="mt-6">
          <CancelOrderBox
            orderId={order._id.toString()}
            canCancel={canCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
