import { Navigation, Radio } from 'lucide-react';
import type { TrainInstance, TrainState } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getDelayStatus, getInstanceStatus } from '@/lib/trainStatus';
import { trendLabel } from '@/lib/trainStatus';

export function ETAHeader({
  trainInstance,
  state,
}: {
  trainInstance: TrainInstance;
  state: TrainState | null;
}) {
  const delay = state?.currentDelayMinutes ?? trainInstance.currentDelayMinutes;
  const trend = state?.delayTrend;
  const status = state ? getInstanceStatus(state.status) : getInstanceStatus(trainInstance.status);
  const delayStatus = getDelayStatus(delay, trend ?? undefined);

  return (
    <div className="rounded-2xl bg-neutral-950 px-5 py-4 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
            <Radio className="h-3.5 w-3.5 text-error-400" /> Live
            <span className="font-mono">{trainInstance.trainNumber}</span>
          </div>
          <h2 className="mt-1 text-lg font-bold leading-tight">{trainInstance.trainName}</h2>
        </div>
        <StatusBadge
          status={status}
          size="sm"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/50">Current delay</div>
          <div className="mt-0.5 text-xl font-bold">
            {delay === 0 ? 'On time' : `+${delay} min`}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/50">Status</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
            <Navigation className="h-3.5 w-3.5 text-accent-400" />
            {trend ? trendLabel[trend] : delayStatus.label}
          </div>
        </div>
      </div>
    </div>
  );
}
