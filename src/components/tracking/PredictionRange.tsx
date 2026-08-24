import { cn } from '@/lib/cn';

export function PredictionRange({ lower, upper }: { lower: string | null; upper: string | null }) {
  if (!lower || !upper) return null;
  return (
    <div className="flex items-center justify-between rounded-lg bg-primary-50/60 px-3 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">Likely range</span>
      <span className="font-mono text-sm font-bold text-primary-800">
        {lower} <span className="text-primary-400">–</span> {upper}
      </span>
    </div>
  );
}

export function ConfidenceMeter({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? 'bg-success-500' : pct >= 70 ? 'bg-primary-500' : pct >= 55 ? 'bg-warning-500' : 'bg-error-500';
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
        <span className={cn('absolute inset-y-0 left-0 rounded-full', color)} style={{ width: `${pct}%` }} />
      </span>
      {showLabel && <span className="font-mono text-xs font-semibold text-neutral-600">{pct}%</span>}
    </span>
  );
}
