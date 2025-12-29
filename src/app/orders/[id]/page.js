import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import CancelOrderBox from "./ui/CancelOrderBox";

export default async function OrderDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div>Connexion requise.</div>;

  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return <div>Commande introuvable.</div>;

  const isOwner = order.userId && order.userId.toString() === session.user.id;
  const isAdmin = !!session.user.isAdmin;
  if (!isAdmin && !isOwner) return <div>Accès interdit.</div>;

  const canCancel = !order.canceledAt && order.status !== "LIVRER";

  return (
    <div className="border rounded p-4">
      <h1 className="text-2xl font-bold text-brand-green">Fiche de commande</h1>

      <div className="mt-3 text-sm space-y-1">
        <div><strong>Code:</strong> {order.orderCode}</div>
        <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
        <div><strong>Statut:</strong> {order.status}</div>
        <div><strong>Total articles:</strong> {order.totalItems}</div>
        <div><strong>Total:</strong> {order.totalPrice} FCFA</div>
        <div><strong>Contact:</strong> {order.contactPhone}</div>
        <div><strong>Adresse:</strong> {order.deliveryAddress}</div>
        {order.canceledAt ? (
          <div className="text-red-600">
            <strong>Annulée le:</strong> {new Date(order.canceledAt).toLocaleString()} <br />
            <strong>Raison:</strong> {order.cancelReason}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Articles</h2>
        <div className="mt-2 space-y-2">
          {order.items.map((it, idx) => (
            <div key={idx} className="border rounded p-2 flex justify-between">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">{it.quantity} × {it.price} FCFA</div>
              </div>
              <div className="font-bold text-brand-green">{it.quantity * it.price} FCFA</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <CancelOrderBox orderId={order._id.toString()} canCancel={canCancel} />
      </div>
    </div>
  );
}