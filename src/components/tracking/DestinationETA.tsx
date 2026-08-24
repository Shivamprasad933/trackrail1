import { Flag, Clock, Gauge, ShieldCheck } from 'lucide-react';
import type { ETAState } from '@/types';
import { formatTime } from '@/lib/format';
import { PredictionRange, ConfidenceMeter } from './PredictionRange';

export function DestinationETA({ eta }: { eta: ETAState['destination'] }) {
  const delay = eta.predictedDelayMinutes;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Destination</span>
        <span className="chip bg-error-50 text-error-700">
          <Flag className="h-3 w-3" /> Final stop
        </span>
      </div>
      <h3 className="mt-2 text-lg font-bold text-neutral-900">{eta.stationName}</h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-neutral-50 px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] font-medium uppercase text-neutral-400">
            <Clock className="h-3 w-3" /> Predicted arrival
          </div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{formatTime(eta.predictedArrival)}</div>
        </div>
        <div className="rounded-lg bg-neutral-50 px-3 py-2">
          <div className="text-[11px] font-medium uppercase text-neutral-400">Scheduled</div>
          <div className="mt-0.5 text-base font-semibold text-neutral-500">{formatTime(eta.scheduledArrival)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Gauge className="h-4 w-4 text-neutral-400" />
          <span className="text-neutral-500">Expected delay</span>
          <span className={delay === 0 ? 'font-semibold text-success-700' : 'font-semibold text-warning-700'}>
            {delay === 0 ? 'On time' : `+${delay} min`}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-primary-500" />
          <ConfidenceMeter value={eta.confidence} />
        </span>
      </div>

      <div className="mt-3">
        <PredictionRange lower={eta.lowerBound} upper={eta.upperBound} />
      </div>
    </div>
  );
}
