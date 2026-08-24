import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Radio, Ticket, TrainFront, X } from 'lucide-react';
import { bookingApi } from '@/services/bookingApi';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingApi.get(id!),
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancel(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  if (isLoading) return <FullScreenSpinner label="Loading ticket…" />;
  if (isError || !booking) return <ErrorState title="Ticket not found" description="This booking could not be loaded." onRetry={() => refetch()} className="py-20" />;

  const cancelled = booking.status === 'CANCELLED';
  const status = cancelled
    ? { kind: 'cancelled' as const, label: 'Cancelled', dotClass: 'bg-error-500', textClass: 'text-error-700', bgClass: 'bg-error-50', icon: 'alert-triangle' as const }
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft className="h-4 w-4" /> Back</button>

      <div className={cn('card overflow-hidden', cancelled && 'opacity-80')}>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="chip bg-white/15 text-white"><Ticket className="h-3.5 w-3.5" /> E-Ticket</span>
            {status && <StatusBadge status={status} size="sm" />}
          </div>
          <div className="mt-3 text-xs uppercase tracking-widest text-white/60">PNR</div>
          <div className="font-mono text-2xl font-bold tracking-wider">{booking.pnr}</div>
        </div>

        {/* Train */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <TrainFront className="h-4 w-4 text-primary-600" />
            <span className="font-mono">{booking.trainNumber}</span> {booking.trainName}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="From" value={booking.fromStation.name} sub={formatTime(booking.departureTime)} />
            <Field label="To" value={booking.toStation.name} sub={formatTime(booking.arrivalTime)} />
            <Field label="Journey date" value={formatDate(booking.journeyDate)} />
            <Field label="Class" value={`${booking.classCode} · ${booking.className}`} />
          </div>

          {/* Passengers */}
          <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-400">Passengers</h3>
          <div className="mt-2 space-y-2">
            {booking.passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                <div>
                  <div className="font-medium text-neutral-800">{p.name}</div>
                  <div className="text-xs text-neutral-500">{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-success-700">{p.bookingStatus}</div>
                  {p.coach && p.seat && <div className="font-mono text-xs text-neutral-500">{p.coach} · {p.seat}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Fare */}
          <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-400">Fare</h3>
          <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Base</span><span>{formatCurrency(booking.fare.baseFare)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Reservation</span><span>{formatCurrency(booking.fare.reservationCharge)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Superfast</span><span>{formatCurrency(booking.fare.superfastCharge)}</span></div>
            {booking.fare.cateringCharge > 0 && <div className="flex justify-between"><span className="text-neutral-500">Catering</span><span>{formatCurrency(booking.fare.cateringCharge)}</span></div>}
            <div className="flex justify-between"><span className="text-neutral-500">GST</span><span>{formatCurrency(booking.fare.gst)}</span></div>
            <div className="mt-1 border-t border-dashed border-neutral-200 pt-1 flex justify-between font-bold"><span>Total</span><span className="text-primary-700">{formatCurrency(booking.fare.total)}</span></div>
          </div>

          {/* QR visual */}
          {booking.qrPayload && (
            <div className="mt-5 flex flex-col items-center">
              <div className="grid grid-cols-12 gap-px rounded-lg bg-neutral-900 p-2">
                {Array.from({ length: 144 }).map((_, i) => (
                  <span key={i} className={cn('h-2 w-2', (i * 7 + booking.pnr.charCodeAt(i % 10)) % 3 === 0 ? 'bg-white' : 'bg-neutral-900')} />
                ))}
              </div>
              <span className="mt-2 font-mono text-[10px] text-neutral-400">{booking.qrPayload.slice(0, 48)}…</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => window.print()} className="btn-secondary"><Download className="h-4 w-4" /> Download</button>
        <Link to={`/track/${booking.trainInstanceId}`} state={{ trainNumber: booking.trainNumber, journeyDate: booking.journeyDate }} className="btn-secondary">
          <Radio className="h-4 w-4 text-error-500" /> Track train
        </Link>
        {!cancelled && (
          <button
            onClick={() => {
              if (confirm('Cancel this ticket? This cannot be undone.')) cancelMutation.mutate();
            }}
            disabled={cancelMutation.isPending}
            className="btn-danger ml-auto"
          >
            <X className="h-4 w-4" /> Cancel ticket
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-sm font-semibold text-neutral-900">{value}</div>
      {sub && <div className="text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}
