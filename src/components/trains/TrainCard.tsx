import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Gauge, MapPin, Navigation, Radio } from 'lucide-react';
import type { TrainSearchResult } from '@/types';
import { formatDuration, formatTime } from '@/lib/format';
import { getDelayStatus } from '@/lib/trainStatus';
import { StatusBadge } from '@/components/common/StatusBadge';

export function TrainCard({ result }: { result: TrainSearchResult }) {
  const { train, trainInstance, fromStation, toStation, departureTime, arrivalTime, durationMinutes, currentDelayMinutes } = result;
  const delayStatus = getDelayStatus(currentDelayMinutes ?? 0);

  return (
    <div className="card p-5 transition hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary-700">{train.trainNumber}</span>
            <span className="text-base font-semibold text-neutral-900">{train.name}</span>
          </div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
            {train.type} · {train.operator}
          </div>
        </div>
        {currentDelayMinutes != null && currentDelayMinutes > 0 && (
          <StatusBadge status={delayStatus} size="sm" />
        )}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <div className="text-xl font-bold text-neutral-900">{formatTime(departureTime)}</div>
          <div className="mt-0.5 truncate text-sm font-medium text-neutral-600">{fromStation.name}</div>
          <div className="font-mono text-xs text-neutral-400">{fromStation.code}</div>
        </div>
        <div className="flex flex-col items-center px-2 text-center">
          <div className="flex items-center gap-1 text-xs font-medium text-neutral-400">
            <Clock className="h-3 w-3" /> {formatDuration(durationMinutes)}
          </div>
          <div className="my-1 h-px w-full bg-gradient-to-r from-neutral-200 via-primary-300 to-neutral-200" />
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Navigation className="h-3 w-3" /> {train.distanceKm} km
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-neutral-900">{formatTime(arrivalTime)}</div>
          <div className="mt-0.5 truncate text-sm font-medium text-neutral-600">{toStation.name}</div>
          <div className="font-mono text-xs text-neutral-400">{toStation.code}</div>
        </div>
      </div>

      {currentDelayMinutes != null && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs">
          <Gauge className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-medium text-neutral-600">Live status:</span>
          <span className={currentDelayMinutes === 0 ? 'font-semibold text-success-700' : 'font-semibold text-warning-700'}>
            {currentDelayMinutes === 0 ? 'On time' : `+${currentDelayMinutes} min delay`}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/trains/${train.trainNumber}`} state={{ fromId: fromStation.id, toId: toStation.id, date: trainInstance.journeyDate }} className="btn-secondary">
          <MapPin className="h-4 w-4" /> Details
        </Link>
        {trainInstance.isTrackingActive && (
          <Link to={`/track/${trainInstance.id}`} state={{ trainNumber: train.trainNumber, journeyDate: trainInstance.journeyDate }} className="btn-secondary">
            <Radio className="h-4 w-4 text-error-500" /> Track
          </Link>
        )}
        <Link
          to={`/booking/${trainInstance.id}`}
          state={{ trainNumber: train.trainNumber, journeyDate: trainInstance.journeyDate, fromId: fromStation.id, toId: toStation.id }}
          className="btn-primary ml-auto"
        >
          Book <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
