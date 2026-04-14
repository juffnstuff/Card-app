import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Save, Check, User, MapPin, Phone, Cake } from 'lucide-react';
import AddressAutocomplete from '../components/AddressAutocomplete';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    mailingAddress: user?.mailingAddress || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load Google Maps key for address autocomplete
  useEffect(() => {
    api.getConfig()
      .then((data) => {
        if (data.googleMapsKey) {
          window.__GOOGLE_MAPS_KEY = data.googleMapsKey;
        }
      })
      .catch((err) => console.error('[Config] Failed to load:', err.message));
  }, []);

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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Your Profile</h1>

      {/* Account info card */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-warmth/10 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-warmth-dark" />
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-charcoal">{user?.name}</p>
            <p className="text-sm text-charcoal-light">{user?.email}</p>
            {memberSince && (
              <p className="text-xs text-charcoal-light/60 mt-0.5">Member since {memberSince}</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-5">
        <h2 className="font-serif text-lg font-bold text-charcoal">Personal Details</h2>

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
          <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
            <Phone size={14} /> Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
            <Cake size={14} /> Your Birthday
          </label>
          <input
            type="text"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
            placeholder="MM/DD or MM/DD/YYYY"
          />
          <p className="text-xs text-charcoal-light mt-1">So your contacts know when to send you a card!</p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
            <MapPin size={14} /> Mailing Address
          </label>
          <AddressAutocomplete
            value={form.mailingAddress}
            onChange={(val) => setForm({ ...form, mailingAddress: val })}
            placeholder="Start typing your address..."
            className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
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
