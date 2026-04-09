import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Package, ExternalLink, Check, X, Truck, Mail, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Card Selected' },
  ordered: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Purchased' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Mailed' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
};

function MailByBadge({ mailByDate }) {
  if (!mailByDate) return null;

  const mailBy = new Date(mailByDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = mailBy - today;
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formatted = mailBy.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (daysUntil < 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertCircle size={14} /> Overdue — mail ASAP!
      </div>
    );
  }
  if (daysUntil === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <Mail size={14} /> Mail today!
      </div>
    );
  }
  if (daysUntil <= 3) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
        <Mail size={14} /> Mail by {formatted} ({daysUntil}d)
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
      <Mail size={14} /> Mail by {formatted} ({daysUntil} days)
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { orderId, action, title }

  const load = () => {
    api.getOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setConfirmAction(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeOrders = orders.filter((o) => ['pending', 'ordered', 'shipped'].includes(o.status));
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  if (loading) return <div className="text-center py-20 text-charcoal-light">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Your Orders</h1>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal">
              {confirmAction.action === 'ordered' && 'Confirm Purchase'}
              {confirmAction.action === 'cancelled' && 'Cancel Order'}
              {confirmAction.action === 'shipped' && 'Mark as Mailed'}
              {confirmAction.action === 'delivered' && 'Mark as Delivered'}
            </h3>
            <p className="text-sm text-charcoal-light">
              {confirmAction.action === 'ordered' && `Did you purchase "${confirmAction.title}" on Amazon? This will calculate your mail-by date.`}
              {confirmAction.action === 'cancelled' && `Remove "${confirmAction.title}" from your active orders? It will move to your history.`}
              {confirmAction.action === 'shipped' && `Did you mail "${confirmAction.title}"?`}
              {confirmAction.action === 'delivered' && `Has "${confirmAction.title}" been delivered?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusChange(confirmAction.orderId, confirmAction.action)}
                className={`flex-1 py-2 rounded-lg font-medium text-white transition-colors ${
                  confirmAction.action === 'cancelled'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-warmth hover:bg-warmth-dark'
                }`}
              >
                {confirmAction.action === 'ordered' && 'Yes, I Bought It'}
                {confirmAction.action === 'cancelled' && 'Yes, Cancel'}
                {confirmAction.action === 'shipped' && 'Yes, Mailed'}
                {confirmAction.action === 'delivered' && 'Yes, Delivered'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 border border-cream-dark text-charcoal-light rounded-lg hover:bg-cream-dark/50 transition-colors"
              >
                Not Yet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Orders */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-charcoal-light">No orders yet. Browse cards to get started!</p>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-charcoal">Active Orders</h2>
              {activeOrders.map((order) => {
                const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-cream-dark p-5 space-y-3">
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
                        <div className="mt-2 flex items-center gap-4 text-sm text-charcoal-light">
                          <span>${order.cardPrice.toFixed(2)}</span>
                          <span>&middot;</span>
                          <span>{new Date(order.orderedAt).toLocaleDateString()}</span>
                          {order.affiliateUrl && (
                            <>
                              <span>&middot;</span>
                              <a
                                href={order.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-warmth-dark hover:underline"
                              >
                                View on Amazon <ExternalLink size={12} />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mail-by date for ordered cards */}
                    {order.status === 'ordered' && order.mailByDate && (
                      <MailByBadge mailByDate={order.mailByDate} />
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ orderId: order.id, action: 'ordered', title: order.cardTitle })}
                            className="flex items-center gap-1.5 px-4 py-2 bg-sage/10 text-sage-dark rounded-lg text-sm font-medium hover:bg-sage/20 transition-colors"
                          >
                            <Check size={15} /> I Bought It
                          </button>
                          <button
                            onClick={() => setConfirmAction({ orderId: order.id, action: 'cancelled', title: order.cardTitle })}
                            className="flex items-center gap-1.5 px-4 py-2 text-red-400 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            <X size={15} /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'ordered' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ orderId: order.id, action: 'shipped', title: order.cardTitle })}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                          >
                            <Truck size={15} /> I Mailed It
                          </button>
                          <button
                            onClick={() => setConfirmAction({ orderId: order.id, action: 'cancelled', title: order.cardTitle })}
                            className="flex items-center gap-1.5 px-4 py-2 text-red-400 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            <X size={15} /> Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => setConfirmAction({ orderId: order.id, action: 'delivered', title: order.cardTitle })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                        >
                          <Check size={15} /> Delivered
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeOrders.length === 0 && historyOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-charcoal-light">All caught up! No active orders.</p>
            </div>
          )}

          {/* Order History */}
          {historyOrders.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal font-medium transition-colors"
              >
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Order History ({historyOrders.length})
              </button>

              {showHistory && (
                <div className="mt-3 space-y-3">
                  {historyOrders.map((order) => {
                    const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-2xl border border-cream-dark p-4 ${
                          order.status === 'cancelled' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg">
                            {order.status === 'delivered' ? '✅' : '❌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${order.status === 'cancelled' ? 'line-through text-charcoal-light' : 'text-charcoal'}`}>
                              {order.cardTitle}
                            </p>
                            <p className="text-sm text-charcoal-light">
                              For {order.contact.name} &middot; {order.date.label} &middot; {new Date(order.orderedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`${s.bg} ${s.text} px-3 py-1 rounded-full text-xs font-medium flex-shrink-0`}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
