import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Save, Check, Crown, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: user?.name || '', mailingAddress: user?.mailingAddress || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const justUpgraded = searchParams.get('upgraded') === '1';
  const isPlusUser = user?.plan === 'plus';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await api.updateProfile(form);
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const data = await api.createPortal();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Your Profile</h1>

      {/* Upgrade success banner */}
      {justUpgraded && (
        <div className="bg-sage/10 border border-sage/30 text-sage-dark px-4 py-3 rounded-lg flex items-center gap-2">
          <Sparkles size={18} />
          <span className="font-medium">Welcome to Plus! You now have unlimited contacts and 14-day reminders.</span>
        </div>
      )}

      {/* Subscription card */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-charcoal">Your Plan</h2>
            {isPlusUser && <Crown size={18} className="text-warmth" />}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPlusUser ? 'bg-warmth/10 text-warmth-dark' : 'bg-cream text-charcoal-light'
          }`}>
            {isPlusUser ? 'Plus' : 'Free'}
          </span>
        </div>

        {isPlusUser ? (
          <div className="space-y-3">
            <p className="text-sm text-charcoal-light">
              Unlimited contacts, 7+14 day reminders, full order history.
            </p>
            {user?.planExpiresAt && (
              <p className="text-xs text-charcoal-light">
                Renews {new Date(user.planExpiresAt).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="text-sm text-warmth-dark hover:underline disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage billing'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-charcoal-light">
              3 contacts, basic reminders. Upgrade for unlimited.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-warmth hover:bg-warmth-dark text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Sparkles size={14} />
              Upgrade to Plus
            </Link>
          </div>
        )}
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/80 text-charcoal-light cursor-not-allowed"
          />
          <p className="text-xs text-charcoal-light mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Mailing Address</label>
          <textarea
            value={form.mailingAddress}
            onChange={(e) => setForm({ ...form, mailingAddress: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors resize-none"
            placeholder="This is where cards get shipped to you"
          />
          <p className="text-xs text-charcoal-light mt-1">Cards are shipped to this address so you can handwrite and mail them yourself</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-warmth hover:bg-warmth-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={18} /> Saved!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
