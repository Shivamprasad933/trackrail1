import { Check, TrainFront } from 'lucide-react';
import type { ETAState, TrainLocation } from '@/types';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ConfidenceMeter } from './PredictionRange';

export function RouteTimeline({ eta, location }: { eta: ETAState; location: TrainLocation | null }) {
  const currentStationId = location?.currentStationId ?? null;
  const nextStationId = location?.nextStationId ?? null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold text-neutral-800">Route timeline</h3>
      <ol className="mt-3 space-y-0">
        {eta.stations.map((stop, idx) => {
          const reached = stop.status === 'REACHED';
          const isCurrent = stop.stationId === currentStationId;
          const isNext = stop.stationId === nextStationId;
          const isLast = idx === eta.stations.length - 1;
          return (
            <li key={stop.stationId} className="relative flex gap-3 pb-5 last:pb-0">
              {/* connector */}
              {!isLast && (
                <span
                  className={cn(
                    'absolute left-[11px] top-6 h-full w-0.5',
                    reached ? 'bg-success-400' : 'bg-neutral-200'
                  )}
                />
              )}
              {/* node */}
              <span
                className={cn(
                  'z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full ring-4 ring-white',
                  reached
                    ? 'bg-success-500 text-white'
                    : isCurrent
                    ? 'bg-accent-500 text-white'
                    : isNext
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-200 text-neutral-400'
                )}
              >
                {reached ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <TrainFront className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>

              {/* content */}
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-sm font-semibold', reached ? 'text-neutral-400 line-through' : 'text-neutral-900')}>
                    {stop.stationName}
                  </span>
                  {isCurrent && <span className="chip bg-accent-50 text-accent-700">Current</span>}
                  {isNext && <span className="chip bg-primary-50 text-primary-700">Next</span>}
                </div>

                {!reached && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-neutral-400">
                      Scheduled <span className="font-mono font-semibold text-neutral-600">{formatTime(stop.scheduledArrival)}</span>
                    </span>
                    <span className="text-neutral-400">
                      Predicted <span className="font-mono font-semibold text-primary-700">{formatTime(stop.predictedArrival)}</span>
                    </span>
                    <span className={stop.predictedDelayMinutes === 0 ? 'font-semibold text-success-700' : 'font-semibold text-warning-700'}>
                      {stop.predictedDelayMinutes === 0 ? 'On time' : `+${stop.predictedDelayMinutes} min`}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <ConfidenceMeter value={stop.confidence} showLabel />
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
