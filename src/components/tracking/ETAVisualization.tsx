import type { ETAState } from '@/types';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/cn';

// A horizontal scheduled-vs-predicted timeline. Each station is a column;
// scheduled time sits on the baseline, predicted time is offset vertically
// by its delay so you can see the train "slipping" to the right.
export function ETAVisualization({ eta }: { eta: ETAState }) {
  const stations = eta.stations.filter((s) => s.scheduledArrival);
  if (stations.length < 2) return null;

  const times = stations
    .flatMap((s) => [s.scheduledArrival!, s.predictedArrival ?? s.scheduledArrival!])
    .map(toMinutes);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(1, max - min);

  const xFor = (t: string) => ((toMinutes(t) - min) / span) * 100;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-800">Scheduled vs predicted</h3>
        <Legend />
      </div>

      <div className="relative mt-6 h-40">
        {/* baseline */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-neutral-200" />
        {/* scheduled line */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            points={stations.map((s, i) => `${(i / (stations.length - 1)) * 100},50`).join(' ')}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
          {/* predicted line */}
          <polyline
            points={stations
              .map((s, i) => {
                const baseX = (i / (stations.length - 1)) * 100;
                const predX = s.predictedArrival ? xFor(s.predictedArrival) : baseX;
                const y = 50 - (s.predictedDelayMinutes > 0 ? Math.min(18, s.predictedDelayMinutes * 1.2) : 0);
                return `${predX},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#1d66f5"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* station dots + labels */}
        {stations.map((s, i) => {
          const baseX = (i / (stations.length - 1)) * 100;
          const reached = s.status === 'REACHED';
          return (
            <div key={s.stationId} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${baseX}%` }}>
              <span className={cn('block h-2.5 w-2.5 rounded-full ring-2 ring-white', reached ? 'bg-success-500' : 'bg-neutral-300')} />
              <span className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-neutral-400">
                {s.stationName.length > 10 ? s.stationName.slice(0, 9) + '…' : s.stationName}
              </span>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-semibold text-neutral-500">
                {formatTime(s.scheduledArrival)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
      <span className="flex items-center gap-1">
        <span className="h-0.5 w-4 border-t-2 border-dashed border-neutral-300" /> Scheduled
      </span>
      <span className="flex items-center gap-1">
        <span className="h-0.5 w-4 bg-primary-600" /> Predicted
      </span>
    </div>
  );
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
