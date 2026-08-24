import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { DEMO_MODE } from '@/lib/env';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-neutral-500">
              Intelligent railway booking and live train tracking with AI-predicted arrival times.
            </p>
            {DEMO_MODE && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
                Demo mode — backend not configured
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Travel</h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li><Link to="/" className="hover:text-primary-600">Search trains</Link></li>
                <li><Link to="/bookings" className="hover:text-primary-600">My bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Account</h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li><Link to="/login" className="hover:text-primary-600">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-primary-600">Create account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">About</h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li><span className="cursor-default">Live tracking</span></li>
                <li><span className="cursor-default">AI ETA</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-100 pt-6 text-xs text-neutral-400">
          © {new Date().getFullYear()} RailFlow. A concept application.
        </div>
      </div>
    </footer>
  );
}
