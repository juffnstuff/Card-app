import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Save, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', mailingAddress: user?.mailingAddress || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Your Profile</h1>

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
