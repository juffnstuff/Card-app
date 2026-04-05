import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Calendar, Users, Package, ChevronRight, Gift, Heart, Star } from 'lucide-react';

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

  const { upcoming, recentOrders, stats } = data;

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-4">Your Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Contacts" value={stats.totalContacts} />
          <StatCard icon={Calendar} label="Important Dates" value={stats.totalDates} />
          <StatCard icon={Package} label="Pending Orders" value={stats.pendingOrders} />
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
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${URGENCY_COLORS[urgency]} transition-all`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.contactName}</p>
                    <p className="text-sm opacity-80">{item.label} &middot; {item.contactRelationship}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">{item.daysUntil}d</p>
                    <p className="text-xs opacity-70">
                      {item.month}/{item.day}
                    </p>
                  </div>
                  <Link
                    to={`/cards?contactId=${item.contactId}&dateId=${item.id}&category=${item.type}&tone=${item.contactTone}`}
                    className="flex-shrink-0 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Send Card
                  </Link>
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-warmth/10 flex items-center justify-center">
        <Icon size={20} className="text-warmth-dark" />
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
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
