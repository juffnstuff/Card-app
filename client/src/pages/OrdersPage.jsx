import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Package } from 'lucide-react';

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  ordered: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ordered' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-charcoal-light">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Your Orders</h1>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-charcoal-light">No orders yet. Browse cards to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-cream-dark p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warmth/10 flex items-center justify-center flex-shrink-0">
                    <Package size={22} className="text-warmth-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-charcoal">{order.cardTitle}</h3>
                        <p className="text-sm text-charcoal-light">
                          For {order.contact.name} &middot; {order.date.label}
                        </p>
                      </div>
                      <span className={`${s.bg} ${s.text} px-3 py-1 rounded-full text-xs font-medium flex-shrink-0`}>
                        {s.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-charcoal-light">
                      <span>${order.cardPrice.toFixed(2)}</span>
                      <span>&middot;</span>
                      <span>{new Date(order.orderedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
