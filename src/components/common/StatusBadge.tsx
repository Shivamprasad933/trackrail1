import {
  Check,
  AlertCircle,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Circle,
  Flag,
  Minus,
} from 'lucide-react';
import type { StatusMeta } from '@/lib/trainStatus';
import { cn } from '@/lib/cn';

const iconMap = {
  check: Check,
  alert: AlertCircle,
  'alert-triangle': AlertTriangle,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  circle: Circle,
  flag: Flag,
  minus: Minus,
} as const;

export function StatusBadge({ status, size = 'md' }: { status: StatusMeta; size?: 'sm' | 'md' }) {
  const Icon = iconMap[status.icon];
  return (
    <span
      className={cn(
        'chip',
        status.bgClass,
        status.textClass,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClass)} />
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {status.label}
    </span>
  );
}
