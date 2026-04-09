import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Check, Crown, Users, Bell, ShoppingBag, Sparkles } from 'lucide-react';

const FREE_FEATURES = [
  'Up to 3 contacts',
  '7-day reminders',
  'Browse & buy cards on Amazon',
  'Basic order tracking',
];

const PLUS_FEATURES = [
  'Unlimited contacts',
  '7-day + 14-day reminders',
  'Browse & buy cards on Amazon',
  'Full order history',
  'Priority email support',
];

export default function PricingPage() {
  const { user } = useAuth();
  const [interval, setInterval] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPlusUser = user?.plan === 'plus';

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.createCheckout(interval);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.createPortal();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Choose Your Plan</h1>
        <p className="text-charcoal-light">
          CardKeeper helps you never forget another birthday, anniversary, or holiday.
          <br />Cards are purchased separately on Amazon — you keep the real card experience.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      {/* Billing toggle */}
      {!isPlusUser && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setInterval('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              interval === 'month' ? 'bg-warmth text-white' : 'bg-cream-dark text-charcoal-light'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              interval === 'year' ? 'bg-warmth text-white' : 'bg-cream-dark text-charcoal-light'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs opacity-80">Save 18%</span>
          </button>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`bg-white rounded-2xl border-2 p-6 space-y-5 ${
          !isPlusUser ? 'border-cream-dark' : 'border-cream-dark opacity-60'
        }`}>
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal">Free</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold text-charcoal">$0</span>
              <span className="text-charcoal-light ml-1">/ forever</span>
            </div>
          </div>

          <ul className="space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-charcoal">
                <Check size={16} className="text-sage mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {!isPlusUser ? (
            <div className="pt-2 text-center text-sm text-charcoal-light font-medium">
              Current plan
            </div>
          ) : (
            <div className="pt-2 text-center text-xs text-charcoal-light">
              Your previous plan
            </div>
          )}
        </div>

        {/* Plus Plan */}
        <div className={`rounded-2xl border-2 p-6 space-y-5 ${
          isPlusUser ? 'bg-warmth/5 border-warmth' : 'bg-white border-warmth/50'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-serif text-xl font-bold text-charcoal">Plus</h2>
              <Crown size={18} className="text-warmth" />
            </div>
            <div className="mt-2">
              {interval === 'month' ? (
                <>
                  <span className="text-3xl font-bold text-charcoal">$3.99</span>
                  <span className="text-charcoal-light ml-1">/ month</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-charcoal">$39</span>
                  <span className="text-charcoal-light ml-1">/ year</span>
                  <span className="block text-xs text-sage-dark mt-1">That's $3.25/mo — save $8.88/yr</span>
                </>
              )}
            </div>
          </div>

          <ul className="space-y-3">
            {PLUS_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-charcoal">
                <Check size={16} className="text-warmth mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPlusUser ? (
            <button
              onClick={handleManage}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium transition-colors bg-cream-dark text-charcoal hover:bg-cream-dark/80 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors bg-warmth hover:bg-warmth-dark text-white disabled:opacity-50"
            >
              <Sparkles size={16} />
              {loading ? 'Loading...' : `Upgrade to Plus`}
            </button>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6">
        <h3 className="font-serif text-lg font-bold text-charcoal mb-4 text-center">How CardKeeper Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-warmth/10 flex items-center justify-center mx-auto">
              <Users size={22} className="text-warmth-dark" />
            </div>
            <p className="text-sm font-medium text-charcoal">Add your people</p>
            <p className="text-xs text-charcoal-light">Save contacts and their important dates</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-warmth/10 flex items-center justify-center mx-auto">
              <Bell size={22} className="text-warmth-dark" />
            </div>
            <p className="text-sm font-medium text-charcoal">Get reminded</p>
            <p className="text-xs text-charcoal-light">Email reminders 7 and 14 days before</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-warmth/10 flex items-center justify-center mx-auto">
              <ShoppingBag size={22} className="text-warmth-dark" />
            </div>
            <p className="text-sm font-medium text-charcoal">Buy the card</p>
            <p className="text-xs text-charcoal-light">Pick a card, buy on Amazon, handwrite it</p>
          </div>
        </div>
      </div>
    </div>
  );
}
