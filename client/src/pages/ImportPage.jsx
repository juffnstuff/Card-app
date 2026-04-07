import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Upload, UserPlus, Check, X, FileText, ChevronLeft } from 'lucide-react';

const RELATIONSHIPS = ['Mother', 'Father', 'Spouse', 'Sibling', 'Child', 'Grandparent', 'Mother-in-Law', 'Father-in-Law', 'Brother-in-Law', 'Sister-in-Law', 'Son-in-Law', 'Daughter-in-Law', 'Cousin', 'Aunt', 'Uncle', 'Niece', 'Nephew', 'Godparent', 'Godchild', 'Stepparent', 'Stepchild', 'Best Friend', 'Friend', 'Coworker', 'Neighbor', 'Boss', 'Mentor', 'Other'];

export default function ImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('choose'); // choose | preview | importing | done
  const [source, setSource] = useState(null); // 'google' | 'csv'
  const [contacts, setContacts] = useState([]); // fetched preview contacts
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Handle Google OAuth callback (or error)
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  useEffect(() => {
    if (oauthError) {
      setError(`Google authorization failed: ${oauthError}. Please try again.`);
      return;
    }
    if (code && step === 'choose') {
      setSource('google');
      setStep('preview');
      setLoading(true);
      api.getGoogleContacts(code)
        .then((data) => {
          setContacts(data.contacts);
          const withBirthdays = new Set();
          data.contacts.forEach((c, i) => {
            if (c.birthday) withBirthdays.add(i);
          });
          setSelected(withBirthdays);
        })
        .catch((err) => {
          setError(err.message);
          setStep('choose');
        })
        .finally(() => setLoading(false));
    }
  }, [code, oauthError]);

  const handleGoogleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getGoogleImportUrl();
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSource('csv');
    setStep('preview');
    setLoading(true);
    setError('');
    try {
      const data = await api.uploadCSV(file);
      setContacts(data.contacts);
      const withBirthdays = new Set();
      data.contacts.forEach((c, i) => {
        if (c.birthday) withBirthdays.add(i);
      });
      setSelected(withBirthdays);
    } catch (err) {
      setError(err.message);
      setStep('choose');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    const toImport = contacts
      .filter((_, i) => selected.has(i))
      .map((c) => ({
        name: c.name,
        relationship: c.relationship || 'Friend',
        tonePreference: 'Sentimental',
        birthday: c.birthday,
      }));

    if (toImport.length === 0) return;

    setStep('importing');
    setLoading(true);
    setError('');
    try {
      const data = await api.saveImportedContacts(toImport);
      setResult(data);
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const formatBirthday = (b) => {
    if (!b) return null;
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[b.month]} ${b.day}${b.year ? `, ${b.year}` : ''}`;
  };

  // ── Choose import method ──
  if (step === 'choose') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <Link to="/contacts" className="text-sm text-warmth-dark hover:underline flex items-center gap-1 mb-3">
            <ChevronLeft size={14} /> Back to Contacts
          </Link>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Import Contacts</h1>
          <p className="text-charcoal-light text-sm mt-1">
            Bring in your contacts and their birthdays automatically.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Google Import */}
        <button
          onClick={handleGoogleConnect}
          disabled={loading}
          className="w-full bg-white rounded-2xl border border-cream-dark p-6 hover:shadow-md transition-shadow text-left flex items-center gap-4 disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-charcoal">Import from Google</p>
            <p className="text-sm text-charcoal-light">Pull contacts and birthdays from your Google account</p>
          </div>
        </button>

        {/* CSV Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white rounded-2xl border border-cream-dark p-6 hover:shadow-md transition-shadow text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center flex-shrink-0">
            <FileText size={24} className="text-sage-dark" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-charcoal">Upload CSV File</p>
            <p className="text-sm text-charcoal-light">Import from a spreadsheet or contacts export</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleCSVUpload}
          className="hidden"
        />

        <p className="text-xs text-charcoal-light/60 text-center">
          CSV columns: Name (or First Name + Last Name), Birthday, Relationship
        </p>
      </div>
    );
  }

  // ── Preview & select contacts ──
  if (step === 'preview') {
    const withBirthday = contacts.filter((c) => c.birthday).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => { setStep('choose'); setContacts([]); setError(''); }} className="text-sm text-warmth-dark hover:underline flex items-center gap-1 mb-3">
            <ChevronLeft size={14} /> Back
          </button>
          <h1 className="font-serif text-2xl font-bold text-charcoal">
            {loading ? 'Fetching contacts...' : `${contacts.length} contacts found`}
          </h1>
          {!loading && (
            <p className="text-charcoal-light text-sm mt-1">
              {withBirthday} with birthdays. Select which ones to import.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-charcoal-light">Loading contacts from {source === 'google' ? 'Google' : 'file'}...</div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
            <p className="text-charcoal-light">No contacts found. Try a different source.</p>
          </div>
        ) : (
          <>
            {/* Select controls */}
            <div className="flex items-center justify-between">
              <button onClick={toggleAll} className="text-sm text-warmth-dark hover:underline">
                {selected.size === contacts.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-sm text-charcoal-light">{selected.size} selected</span>
            </div>

            {/* Contact list */}
            <div className="bg-white rounded-2xl border border-cream-dark divide-y divide-cream-dark max-h-[60vh] overflow-y-auto">
              {contacts.map((c, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    selected.has(idx) ? 'bg-warmth/5' : 'hover:bg-cream/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(idx)}
                    onChange={() => toggleSelect(idx)}
                    className="w-4 h-4 rounded border-cream-dark text-warmth focus:ring-warmth/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal truncate">{c.name}</p>
                    <p className="text-xs text-charcoal-light">
                      {c.relationship}
                      {c.birthday && <span className="ml-2 text-warmth-dark">🎂 {formatBirthday(c.birthday)}</span>}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Import button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-warmth hover:bg-warmth-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <UserPlus size={16} />
                Import {selected.size} Contact{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Importing ──
  if (step === 'importing') {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-4xl mb-4">📥</div>
        <p className="text-charcoal-light font-serif text-lg">Importing your contacts...</p>
      </div>
    );
  }

  // ── Done ──
  return (
    <div className="max-w-lg mx-auto space-y-6 text-center py-10">
      <div className="text-5xl mb-2">🎉</div>
      <h1 className="font-serif text-2xl font-bold text-charcoal">Import Complete!</h1>
      <p className="text-charcoal-light">
        {result?.imported} contact{result?.imported !== 1 ? 's' : ''} imported
        {result?.imported > 0 && ' with their birthdays'}.
      </p>

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/contacts')}
          className="px-5 py-2.5 bg-warmth hover:bg-warmth-dark text-white font-medium rounded-lg transition-colors"
        >
          View Contacts
        </button>
        <button
          onClick={() => { setStep('choose'); setContacts([]); setResult(null); }}
          className="px-5 py-2.5 border border-cream-dark text-charcoal-light rounded-lg hover:bg-cream-dark/50 transition-colors"
        >
          Import More
        </button>
      </div>
    </div>
  );
}
