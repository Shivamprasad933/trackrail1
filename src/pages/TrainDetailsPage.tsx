import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Clock, Flag, Gauge, MapPin, Navigation, Radio, TrainFront } from 'lucide-react';
import { trainApi } from '@/services/trainApi';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { TrainClassBadge } from '@/components/trains/TrainClassBadge';
import { formatDuration, formatTime, todayISO } from '@/lib/format';

export default function TrainDetailsPage() {
  const { trainNumber } = useParams<{ trainNumber: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as { fromId?: string; toId?: string; date?: string };
  const date = state.date ?? todayISO();

  const { data: train, isLoading, isError, refetch } = useQuery({
    queryKey: ['train', trainNumber],
    queryFn: () => trainApi.getTrain(trainNumber!),
    enabled: Boolean(trainNumber),
  });

  const { data: instance } = useQuery({
    queryKey: ['train-instance', trainNumber, date],
    queryFn: () => trainApi.getTrainInstance(trainNumber!, date),
    enabled: Boolean(trainNumber),
  });

  if (isLoading) return <FullScreenSpinner label="Loading train details…" />;
  if (isError || !train) return <ErrorState title="Train unavailable" description="This train could not be found." onRetry={() => refetch()} className="py-20" />;

  const fromId = state.fromId ?? train.originStation.id;
  const toId = state.toId ?? train.destinationStation.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to={-1 as never} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-primary-700 to-primary-800 p-5 text-white">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
            <TrainFront className="h-4 w-4" /> {train.type} · {train.operator}
          </div>
          <h1 className="mt-1 text-xl font-bold">
            <span className="font-mono">{train.trainNumber}</span> {train.name}
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Clock} label="Duration" value={formatDuration(train.durationMinutes)} />
            <Stat icon={Navigation} label="Distance" value={`${train.distanceKm} km`} />
            <Stat icon={MapPin} label="Departs" value={formatTime(train.departureTime)} />
            <Stat icon={Flag} label="Arrives" value={formatTime(train.arrivalTime)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {instance?.isTrackingActive && (
            <Link to={`/track/${instance.id}`} state={{ trainNumber, journeyDate: date }} className="btn-secondary">
              <Radio className="h-4 w-4 text-error-500" /> Track live
            </Link>
          )}
          <Link
            to={`/booking/${instance?.id ?? 'demo'}`}
            state={{ trainNumber: train.trainNumber, journeyDate: date, fromId, toId }}
            className="btn-primary ml-auto"
          >
            Book now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Route timeline */}
      <h2 className="mt-6 text-sm font-bold text-neutral-800">Route & schedule</h2>
      <div className="card mt-2 p-4">
        <ol className="space-y-0">
          {train.route.map((stop, i) => {
            const isOrigin = i === 0;
            const isDest = i === train.route.length - 1;
            return (
              <li key={stop.stationId} className="relative flex gap-4 pb-5 last:pb-0">
                {!isDest && <span className="absolute left-[7px] top-5 h-full w-0.5 bg-neutral-200" />}
                <span className={`z-10 mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white ${isOrigin ? 'bg-success-500' : isDest ? 'bg-error-500' : 'bg-primary-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{stop.station.name}</span>
                      <span className="ml-2 font-mono text-xs text-neutral-400">{stop.station.code}</span>
                    </div>
                    {stop.platform && <span className="chip bg-neutral-100 text-neutral-600">PF {stop.platform}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>Arr {formatTime(stop.scheduledArrival)}</span>
                    <span>Dep {formatTime(stop.scheduledDeparture)}</span>
                    <span>Halt {stop.haltMinutes}m</span>
                    <span>Day {stop.dayOfJourney}</span>
                    <span>{stop.distanceKm} km</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Classes */}
      <h2 className="mt-6 text-sm font-bold text-neutral-800">Available classes & fare</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {train.classes.map((c) => (
          <TrainClassBadge key={c.code} cls={c} />
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-white/60">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
