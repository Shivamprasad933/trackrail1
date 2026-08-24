import { Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Mail, Phone, Shield, Ticket, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-primary-700 to-primary-800 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                <Shield className="h-3.5 w-3.5" /> {user.role === 'admin' ? 'Administrator' : 'Traveller'}
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            <Detail icon={Mail} label="Email" value={user.email} />
            {user.phone && <Detail icon={Phone} label="Phone" value={user.phone} />}
            <Detail icon={UserIcon} label="User ID" value={user.id} mono />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link to="/bookings" className="btn-secondary"><Ticket className="h-4 w-4" /> My bookings</Link>
            {isAdmin && <Link to="/admin" className="btn-secondary"><LayoutDashboard className="h-4 w-4" /> Admin dashboard</Link>}
          </div>

          <button onClick={logout} className="btn-danger mt-4 w-full">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value, mono }: { icon: typeof Mail; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-neutral-500"><Icon className="h-4 w-4" /> {label}</span>
      <span className={`text-sm font-semibold text-neutral-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
