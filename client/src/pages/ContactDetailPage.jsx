import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, Trash2, Plus, Edit2, Save, X } from 'lucide-react';

const DATE_TYPES = ['birthday', 'anniversary', 'graduation', 'holiday', 'custom'];
const TONES = ['Funny', 'Sentimental', 'Religious', 'Kids', 'Edgy/Adult Humor'];
const RELATIONSHIPS = ['Mother', 'Father', 'Spouse', 'Sibling', 'Child', 'Grandparent', 'Best Friend', 'Friend', 'Coworker', 'Neighbor', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDateForm, setShowDateForm] = useState(false);
  const [dateForm, setDateForm] = useState({ type: 'birthday', label: 'Birthday', month: 1, day: 1, year: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getContact(id)
      .then((data) => {
        setContact(data.contact);
        setEditForm({ name: data.contact.name, relationship: data.contact.relationship, tonePreference: data.contact.tonePreference });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSaveContact = async () => {
    setSaving(true);
    try {
      await api.updateContact(id, editForm);
      setEditing(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!confirm('Delete this contact and all their dates? This cannot be undone.')) return;
    try {
      await api.deleteContact(id);
      navigate('/contacts');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createDate({
        contactId: id,
        type: dateForm.type,
        label: dateForm.label,
        month: parseInt(dateForm.month),
        day: parseInt(dateForm.day),
        year: dateForm.year ? parseInt(dateForm.year) : null,
      });
      setShowDateForm(false);
      setDateForm({ type: 'birthday', label: 'Birthday', month: 1, day: 1, year: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDate = async (dateId) => {
    try {
      await api.deleteDate(dateId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-20 text-charcoal-light">Loading...</div>;
  if (!contact) return <div className="bg-red-50 text-red-700 rounded-xl p-4">Contact not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/contacts')} className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors">
        <ArrowLeft size={18} /> Back to Contacts
      </button>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      {/* Contact Info */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-warmth/10 flex items-center justify-center text-2xl">
              👤
            </div>
            {editing ? (
              <div className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold px-2 py-1 border border-cream-dark rounded-lg"
                />
                <div className="flex gap-2">
                  <select
                    value={editForm.relationship}
                    onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                    className="text-sm px-2 py-1 border border-cream-dark rounded-lg"
                  >
                    {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <select
                    value={editForm.tonePreference}
                    onChange={(e) => setEditForm({ ...editForm, tonePreference: e.target.value })}
                    className="text-sm px-2 py-1 border border-cream-dark rounded-lg"
                  >
                    {TONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-serif text-2xl font-bold text-charcoal">{contact.name}</h1>
                <p className="text-charcoal-light">{contact.relationship} &middot; {contact.tonePreference}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSaveContact} disabled={saving} className="p-2 text-sage-dark hover:bg-sage/10 rounded-lg transition-colors">
                  <Save size={18} />
                </button>
                <button onClick={() => setEditing(false)} className="p-2 text-charcoal-light hover:bg-cream-dark/50 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="p-2 text-charcoal-light hover:bg-cream-dark/50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={handleDeleteContact} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-white rounded-2xl border border-cream-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-charcoal">Important Dates</h2>
          <button
            onClick={() => setShowDateForm(!showDateForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-warmth/10 text-warmth-dark rounded-lg text-sm font-medium hover:bg-warmth/20 transition-colors"
          >
            <Plus size={16} /> Add Date
          </button>
        </div>

        {showDateForm && (
          <form onSubmit={handleAddDate} className="bg-cream/50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Type</label>
                <select
                  value={dateForm.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const labels = { birthday: 'Birthday', anniversary: 'Anniversary', graduation: 'Graduation', holiday: 'Holiday', custom: '' };
                    setDateForm({ ...dateForm, type, label: labels[type] || '' });
                  }}
                  className="w-full px-2 py-1.5 border border-cream-dark rounded-lg text-sm bg-white"
                >
                  {DATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Label</label>
                <input
                  value={dateForm.label}
                  onChange={(e) => setDateForm({ ...dateForm, label: e.target.value })}
                  className="w-full px-2 py-1.5 border border-cream-dark rounded-lg text-sm bg-white"
                  placeholder="e.g. Birthday"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Month</label>
                <select
                  value={dateForm.month}
                  onChange={(e) => setDateForm({ ...dateForm, month: e.target.value })}
                  className="w-full px-2 py-1.5 border border-cream-dark rounded-lg text-sm bg-white"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dateForm.day}
                  onChange={(e) => setDateForm({ ...dateForm, day: e.target.value })}
                  className="w-full px-2 py-1.5 border border-cream-dark rounded-lg text-sm bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">Year (opt.)</label>
                <input
                  type="number"
                  value={dateForm.year}
                  onChange={(e) => setDateForm({ ...dateForm, year: e.target.value })}
                  className="w-full px-2 py-1.5 border border-cream-dark rounded-lg text-sm bg-white"
                  placeholder="e.g. 1990"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-1.5 bg-warmth text-white rounded-lg text-sm font-medium hover:bg-warmth-dark transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Date'}
              </button>
              <button type="button" onClick={() => setShowDateForm(false)} className="px-4 py-1.5 border border-cream-dark text-charcoal-light rounded-lg text-sm hover:bg-cream-dark/50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {contact.importantDates.length === 0 ? (
          <p className="text-charcoal-light text-sm py-4 text-center">No dates added yet.</p>
        ) : (
          <div className="space-y-2">
            {contact.importantDates.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3 px-4 bg-cream/30 rounded-xl">
                <div>
                  <p className="font-medium text-charcoal">{d.label}</p>
                  <p className="text-sm text-charcoal-light">
                    {MONTHS[d.month - 1]} {d.day}{d.year ? `, ${d.year}` : ''} &middot; {d.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cards?contactId=${contact.id}&dateId=${d.id}&category=${d.type}&tone=${contact.tonePreference}`}
                    className="px-3 py-1 bg-warmth/10 text-warmth-dark rounded-lg text-sm font-medium hover:bg-warmth/20 transition-colors"
                  >
                    Send Card
                  </Link>
                  <button
                    onClick={() => handleDeleteDate(d.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
