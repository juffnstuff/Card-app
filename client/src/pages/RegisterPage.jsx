import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MIN_PASSWORD_LENGTH } from '../constants';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', mailingAddress: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.mailingAddress);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Create your account</h1>
          <p className="text-charcoal-light mt-1">Never miss sending a card again</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-cream-dark p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={update('name')}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
              placeholder="Alex Johnson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Mailing Address <span className="text-charcoal-light font-normal">(where cards ship to you)</span>
            </label>
            <textarea
              value={form.mailingAddress}
              onChange={update('mailingAddress')}
              rows={2}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/50 focus:outline-none focus:ring-2 focus:ring-warmth/30 focus:border-warmth transition-colors resize-none"
              placeholder="123 Maple Street, Portland, OR 97201"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-warmth hover:bg-warmth-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-charcoal-light">
            Already have an account?{' '}
            <Link to="/login" className="text-warmth-dark font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
