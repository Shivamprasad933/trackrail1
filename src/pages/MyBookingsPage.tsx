import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronRight, Ticket, TrainFront } from 'lucide-react';
import { bookingApi } from '@/services/bookingApi';
import { useAuth } from '@/context/AuthContext';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cancelled as cancelledStatus } from '@/lib/trainStatus';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => bookingApi.mine(user!.id),
    enabled: Boolean(user),
  });

  if (isLoading) return <FullScreenSpinner label="Loading bookings…" />;
  if (isError) return <ErrorState title="Could not load bookings" onRetry={() => refetch()} className="py-20" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold text-neutral-900">My bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">All your tickets in one place.</p>

      {!data || data.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Ticket className="h-6 w-6" />}
          title="No bookings yet"
          description="Search for a train and book your first ticket."
          action={<Link to="/" className="btn-primary">Find trains</Link>}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            return (
              <Link key={b.id} to={`/bookings/${b.id}`} className={cn('card block p-4 transition hover:shadow-card-hover', isCancelled && 'opacity-70')}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      <TrainFront className="h-4 w-4 text-primary-600" />
                      <span className="font-mono">{b.trainNumber}</span> {b.trainName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar className="h-3 w-3" /> {formatDate(b.journeyDate)}
                      <span>·</span>
                      {formatTime(b.departureTime)} → {formatTime(b.arrivalTime)}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">{b.fromStation.name} → {b.toStation.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-neutral-700">{b.pnr}</div>
                    <div className="mt-1 text-sm font-bold text-primary-700">{formatCurrency(b.fare.total)}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {isCancelled ? <StatusBadge status={cancelledStatus} size="sm" /> : (
                    <span className="chip bg-success-50 text-success-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> {b.passengers.length} passenger{b.passengers.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
