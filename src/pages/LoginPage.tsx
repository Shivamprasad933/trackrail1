import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';
import { Spinner } from '@/components/common/Spinner';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="mb-6 flex justify-center"><Logo /></div>
      <div className="card p-6">
        <h1 className="text-xl font-bold text-neutral-900">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to manage bookings and track trains.</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input type="email" className="input pl-9" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input type="password" className="input pl-9" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Spinner size={18} /> : <><LogIn className="h-4 w-4" /> Sign in</>}
          </button>
        </form>

        <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <div className="font-semibold text-neutral-600">Demo accounts</div>
          <div className="mt-1">User: priya@example.com / demo123</div>
          <div>Admin: admin@railflow.in / admin123</div>
        </div>

        <p className="mt-4 text-center text-sm text-neutral-500">
          New here? <Link to="/register" className="font-semibold text-primary-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
