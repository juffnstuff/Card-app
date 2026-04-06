import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Plus, Search, UserCircle, ChevronRight, Crown, Upload } from 'lucide-react';

const TONE_COLORS = {
  Funny: 'bg-amber-100 text-amber-800',
  Sentimental: 'bg-pink-100 text-pink-800',
  Religious: 'bg-indigo-100 text-indigo-800',
  Kids: 'bg-green-100 text-green-800',
  'Edgy/Adult Humor': 'bg-red-100 text-red-800',
};

const RELATIONSHIPS = ['Mother', 'Father', 'Spouse', 'Sibling', 'Child', 'Grandparent', 'Best Friend', 'Friend', 'Coworker', 'Neighbor', 'Other'];
const TONES = ['Funny', 'Sentimental', 'Religious', 'Kids', 'Edgy/Adult Humor'];

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: 'Friend', tonePreference: 'Sentimental' });
  const [saving, setSaving] = useState(false);

  const isFree = user?.plan !== 'plus';

  const load = () => {
    api.getContacts()
      .then((data) => setContacts(data.contacts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createContact(form);
      setForm({ name: '', relationship: 'Friend', tonePreference: 'Sentimental' });
      setShowForm(false);
      load();
    } catch (err) {
      if (err.message?.includes('Upgrade to Plus') || err.message?.includes('CONTACT_LIMIT')) {
        setLimitHit(true);
      }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.relationship.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20 text-charcoal-light">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Contacts</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/import"
            className="flex items-center gap-2 px-4 py-2 border border-cream-dark text-charcoal-light hover:bg-cream-dark/50 rounded-lg font-medium transition-colors"
          >
            <Upload size={16} /> Import
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-warmth hover:bg-warmth-dark text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> Add Contact
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Upgrade prompt when hitting contact limit */}
      {limitHit && isFree && (
        <div className="bg-warmth/5 border border-warmth/30 rounded-2xl p-5 flex items-center gap-4">
          <Crown size={24} className="text-warmth flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">You've reached the free plan limit (3 contacts)</p>
            <p className="text-sm text-charcoal-light">Upgrade to Plus for unlimited contacts and 14-day reminders.</p>
          </div>
          <Link
            to="/pricing"
            className="flex-shrink-0 px-4 py-2 bg-warmth hover:bg-warmth-dark text-white rounded-lg font-medium transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* New Contact Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold">New Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth"
                placeholder="Contact name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth"
              >
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Tone Preference</label>
              <select
                value={form.tonePreference}
                onChange={(e) => setForm({ ...form, tonePreference: e.target.value })}
                className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth"
              >
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-warmth hover:bg-warmth-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Contact'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-cream-dark text-charcoal-light rounded-lg hover:bg-cream-dark/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2.5 border border-cream-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth"
        />
      </div>

      {/* Contact List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-charcoal-light">
            {contacts.length === 0 ? 'No contacts yet. Add your first one!' : 'No contacts match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-dark divide-y divide-cream-dark">
          {filtered.map((contact) => (
            <Link
              key={contact.id}
              to={`/contacts/${contact.id}`}
              className="flex items-center gap-4 p-4 hover:bg-cream/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-warmth/10 flex items-center justify-center flex-shrink-0">
                <UserCircle size={24} className="text-warmth-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal truncate">{contact.name}</p>
                <p className="text-sm text-charcoal-light">
                  {contact.relationship} &middot; {contact.importantDates.length} date{contact.importantDates.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TONE_COLORS[contact.tonePreference] || 'bg-gray-100 text-gray-800'}`}>
                {contact.tonePreference}
              </span>
              <ChevronRight size={18} className="text-charcoal-light flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
