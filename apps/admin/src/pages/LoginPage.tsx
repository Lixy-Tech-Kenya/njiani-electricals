import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.auth.login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Njiani Admin</h1>
          <p className="text-gray-500">Sign in to manage your marketplace</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@njiani.co.ke"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={20} />}
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          &copy; 2024 Njiani Electricals Limited
        </p>
      </div>
    </div>
  );
}
