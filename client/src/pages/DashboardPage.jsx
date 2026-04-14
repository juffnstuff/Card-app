import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Calendar, Users, Package, ChevronRight, Gift, Heart, Star, Check, Mail, AlertTriangle } from 'lucide-react';

const EVENT_ICONS = {
  birthday: Gift,
  anniversary: Heart,
  graduation: Star,
  holiday: Star,
  custom: Calendar,
};

const URGENCY_COLORS = {
  urgent: 'bg-red-50 border-red-200 text-red-800',
  soon: 'bg-amber-50 border-amber-200 text-amber-800',
  upcoming: 'bg-sage/10 border-sage/30 text-sage-dark',
};

function getUrgency(daysUntil) {
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 14) return 'soon';
  return 'upcoming';
}

function OrderBadge({ order }) {
  if (!order) return null;

  if (order.status === 'pending') {
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
        Card Selected
      </span>
    );
  }
  if (order.status === 'ordered') {
    const mailBy = order.mailByDate ? new Date(order.mailByDate) : null;
    const formatted = mailBy?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        {formatted ? `Mail by ${formatted}` : 'Purchased'}
      </span>
    );
  }
  if (order.status === 'shipped') {
    return (
      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
        <Mail size={10} /> Mailed
      </span>
    );
  }
  if (order.status === 'delivered') {
    return (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <Check size={10} /> Sent
      </span>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-charcoal-light">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200">Failed to load dashboard data.</div>
    );
  }

  const { upcoming, recentOrders, stats } = data;

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-4">Your Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Contacts" value={stats.totalContacts} />
          <StatCard icon={Calendar} label="Important Dates" value={stats.totalDates} />
          <StatCard icon={AlertTriangle} label="Needs Action" value={stats.needsAction} highlight={stats.needsAction > 0} />
        </div>
      </div>

      {/* Upcoming Dates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-charcoal">Upcoming Dates</h2>
          <Link to="/contacts" className="text-sm text-warmth-dark hover:underline flex items-center gap-1">
            Manage contacts <ChevronRight size={14} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-charcoal-light mb-3">No upcoming dates in the next 60 days.</p>
            <Link
              to="/contacts"
              className="inline-block px-5 py-2 bg-warmth text-white rounded-lg font-medium hover:bg-warmth-dark transition-colors"
            >
              Add a Contact
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((item) => {
              const urgency = getUrgency(item.daysUntil);
              const Icon = EVENT_ICONS[item.type] || Calendar;
              const hasOrder = !!item.order;
              const orderDone = item.order?.status === 'delivered' || item.order?.status === 'shipped';

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${URGENCY_COLORS[urgency]} transition-all`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{item.contactName}</p>
                      <OrderBadge order={item.order} />
                    </div>
                    <p className="text-sm opacity-80">{item.label} &middot; {item.contactRelationship}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">{item.daysUntil}d</p>
                    <p className="text-xs opacity-70">
                      {item.month}/{item.day}
                    </p>
                  </div>

                  {/* CTA based on order status */}
                  {!hasOrder ? (
                    <Link
                      to={`/cards?contactId=${item.contactId}&dateId=${item.id}&category=${item.type}&tone=${item.contactTone}`}
                      className="flex-shrink-0 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Send Card
                    </Link>
                  ) : item.order.status === 'pending' ? (
                    <Link
                      to="/orders"
                      className="flex-shrink-0 px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirm Purchase
                    </Link>
                  ) : !orderDone ? (
                    <Link
                      to="/orders"
                      className="flex-shrink-0 px-3 py-1.5 bg-blue-200/60 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Order
                    </Link>
                  ) : (
                    <span className="flex-shrink-0 px-3 py-1.5 text-sm text-green-600 font-medium">
                      Done ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-charcoal">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-warmth-dark hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-cream-dark divide-y divide-cream-dark">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg">
                  📬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.cardTitle}</p>
                  <p className="text-sm text-charcoal-light">
                    For {order.contact.name} &middot; {order.date.label}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
      highlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-cream-dark'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        highlight ? 'bg-amber-100' : 'bg-warmth/10'
      }`}>
        <Icon size={20} className={highlight ? 'text-amber-700' : 'text-warmth-dark'} />
      </div>
      <div>
        <p className="text-2xl font-bold text-charcoal">{value}</p>
        <p className="text-sm text-charcoal-light">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    ordered: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    pending: 'Selected',
    ordered: 'Purchased',
    shipped: 'Mailed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}
