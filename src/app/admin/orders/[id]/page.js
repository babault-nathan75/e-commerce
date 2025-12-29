import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import OrderStatusBox from "./ui/OrderStatusBox";

export default async function AdminOrderDetailsPage({ params }) {
  await connectDB();

  const order = await Order.findById(params.id);
  if (!order) return <div>Commande introuvable.</div>;

  // Optionnel: si commande d’un user connecté, on récupère ses infos
  let user = null;
  if (order.userId) {
    user = await User.findById(order.userId).select("name email phone isAdmin");
  }

  const isGuest = !!order.guest?.email;

  const displayName = isGuest ? order.guest?.name : (user?.name || "Utilisateur");
  const displayEmail = isGuest ? order.guest?.email : (user?.email || "");
  const displayPhone = isGuest ? order.guest?.phone : (user?.phone || order.contactPhone || "");
  const displayAddress = isGuest ? order.guest?.deliveryAddress : (order.deliveryAddress || "");

  return (
    <div className="border rounded p-4">
      <h1 className="text-2xl font-bold text-brand-green">Détail commande (Admin)</h1>

      <div className="mt-3 text-sm space-y-1">
        <div><strong>Code:</strong> {order.orderCode}</div>
        <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
        <div><strong>Statut:</strong> {order.status}</div>

        <div className="mt-2">
          <strong>Client:</strong> {displayName}{" "}
          {displayEmail ? <span className="text-gray-600">({displayEmail})</span> : null}
        </div>
        <div><strong>Contact:</strong> {displayPhone}</div>
        <div><strong>Adresse:</strong> {displayAddress}</div>

        {order.canceledAt ? (
          <div className="mt-2 text-red-700">
            <div><strong>Annulée le:</strong> {new Date(order.canceledAt).toLocaleString()}</div>
            <div><strong>Justificatif:</strong> {order.cancelReason}</div>
            <div><strong>Annulée par:</strong> {order.canceledBy}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Articles commandés</h2>
        <div className="mt-2 space-y-2">
          {order.items.map((it, idx) => (
            <div key={idx} className="border rounded p-2 flex justify-between">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">
                  {it.quantity} × {it.price} FCFA
                </div>
              </div>
              <div className="font-bold text-brand-green">
                {it.quantity * it.price} FCFA
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border rounded p-3">
          <div className="flex justify-between">
            <span>Total articles</span>
            <strong>{order.totalItems}</strong>
          </div>
          <div className="flex justify-between mt-2">
            <span>Total</span>
            <strong className="text-brand-orange">{order.totalPrice} FCFA</strong>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <OrderStatusBox orderId={order._id.toString()} status={order.status} canceledAt={order.canceledAt} />
      </div>
    </div>
  );
}