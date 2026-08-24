import { useState } from 'react';
import {
  Activity,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Train,
  TrafficCone,
  Timer,
  TrendingDown,
} from 'lucide-react';
import { simulationApi } from '@/services/simulationApi';
import type { SimulationEventType, SimulationStatus } from '@/types';
import { cn } from '@/lib/cn';

const events: { code: SimulationEventType; label: string; icon: typeof Plus; tone: string }[] = [
  { code: 'ADD_DELAY_5', label: 'Add Delay +5', icon: Plus, tone: 'text-warning-700 bg-warning-50 hover:bg-warning-100' },
  { code: 'ADD_DELAY_15', label: 'Add Delay +15', icon: Plus, tone: 'text-error-700 bg-error-50 hover:bg-error-100' },
  { code: 'HEAVY_CONGESTION', label: 'Heavy Congestion', icon: TrafficCone, tone: 'text-accent-700 bg-accent-50 hover:bg-accent-100' },
  { code: 'SPEED_RESTRICTION', label: 'Speed Restriction', icon: Train, tone: 'text-primary-700 bg-primary-50 hover:bg-primary-100' },
  { code: 'LONG_STATION_HALT', label: 'Long Station Halt', icon: Timer, tone: 'text-warning-700 bg-warning-50 hover:bg-warning-100' },
  { code: 'RECOVER_DELAY', label: 'Recover Delay', icon: TrendingDown, tone: 'text-success-700 bg-success-50 hover:bg-success-100' },
];

export function SimulationPanel({
  trainInstanceId,
  onStatus,
}: {
  trainInstanceId: string;
  onStatus?: (s: SimulationStatus) => void;
}) {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const call = async (fn: () => Promise<SimulationStatus>) => {
    setBusy(true);
    try {
      const s = await fn();
      setStatus(s);
      onStatus?.(s);
    } finally {
      setBusy(false);
    }
  };

  const start = () => call(() => simulationApi.start(trainInstanceId));
  const pause = () => call(() => simulationApi.pause(trainInstanceId));
  const reset = () => call(() => simulationApi.reset(trainInstanceId));
  const event = (code: SimulationEventType) => call(() => simulationApi.event(trainInstanceId, code));

  return (
    <div className="card border-accent-200 bg-accent-50/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
          <Activity className="h-4 w-4 text-accent-600" /> Simulation mode
          <span className="chip bg-accent-100 text-accent-700">Demo only</span>
        </h3>
        {status?.lastEvent && (
          <span className="text-xs font-medium text-neutral-500">Last: {status.lastEvent.replace(/_/g, ' ').toLowerCase()}</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!status?.isRunning ? (
          <button onClick={start} disabled={busy} className="btn-primary">
            <Play className="h-4 w-4" /> Start Simulation
          </button>
        ) : (
          <button onClick={pause} disabled={busy} className="btn-secondary">
            <Pause className="h-4 w-4" /> Pause
          </button>
        )}
        <button onClick={reset} disabled={busy} className="btn-secondary">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {events.map((e) => (
          <button
            key={e.code}
            onClick={() => event(e.code)}
            disabled={busy}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition disabled:opacity-50',
              e.tone
            )}
          >
            <e.icon className="h-3.5 w-3.5" /> {e.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-neutral-500">
        Triggers call backend simulation APIs. The map and panels update through normal live events.
      </p>
    </div>
  );
}
