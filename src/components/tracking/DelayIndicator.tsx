import { TrendingDown, TrendingUp, Minus, Activity } from 'lucide-react';
import type { DelayTrend } from '@/types';
import { trendLabel } from '@/lib/trainStatus';
import { cn } from '@/lib/cn';

const config: Record<DelayTrend, { icon: typeof TrendingDown; cls: string; ring: string }> = {
  RECOVERING: { icon: TrendingDown, cls: 'text-success-700 bg-success-50', ring: 'ring-success-200' },
  MAINTAINING: { icon: Minus, cls: 'text-warning-700 bg-warning-50', ring: 'ring-warning-200' },
  INCREASING: { icon: TrendingUp, cls: 'text-error-700 bg-error-50', ring: 'ring-error-200' },
  STABLE: { icon: Activity, cls: 'text-primary-700 bg-primary-50', ring: 'ring-primary-200' },
};

export function DelayIndicator({ trend, delayMinutes }: { trend: DelayTrend; delayMinutes: number }) {
  const c = config[trend];
  const Icon = c.icon;
  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-4 py-3 ring-1', c.cls, c.ring)}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/70">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wide opacity-70">Delay trend</div>
        <div className="text-sm font-bold">{trendLabel[trend]}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-medium uppercase tracking-wide opacity-70">Delay</div>
        <div className="text-lg font-bold">{delayMinutes === 0 ? '0' : `+${delayMinutes}`} min</div>
      </div>
    </div>
  );
}
