import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Plus, Search, UserCircle, ChevronRight, Upload } from 'lucide-react';
import { RELATIONSHIPS, TONES, TONE_COLORS } from '../constants';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: 'Friend', tonePreference: 'Sentimental', isMother: false, isFather: false });
  const [saving, setSaving] = useState(false);

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
      setForm({ name: '', relationship: 'Friend', tonePreference: 'Sentimental', isMother: false, isFather: false });
      setShowForm(false);
      load();
    } catch (err) {
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
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMother}
                onChange={(e) => setForm({ ...form, isMother: e.target.checked })}
                className="w-4 h-4 rounded border-cream-dark text-warmth focus:ring-warmth/30"
              />
              This person is a mother
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFather}
                onChange={(e) => setForm({ ...form, isFather: e.target.checked })}
                className="w-4 h-4 rounded border-cream-dark text-warmth focus:ring-warmth/30"
              />
              This person is a father
            </label>
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
