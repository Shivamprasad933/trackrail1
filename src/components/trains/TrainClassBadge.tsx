import type { TrainClass } from '@/types';
import { cn } from '@/lib/cn';

const statusStyles: Record<TrainClass['availabilityStatus'], string> = {
  AVAILABLE: 'bg-success-50 text-success-700',
  RAC: 'bg-warning-50 text-warning-700',
  WL: 'bg-accent-50 text-accent-700',
  REGRET: 'bg-error-50 text-error-700',
};

const statusLabel: Record<TrainClass['availabilityStatus'], string> = {
  AVAILABLE: 'Available',
  RAC: 'RAC',
  WL: 'Waitlist',
  REGRET: 'Regret',
};

export function TrainClassBadge({ cls }: { cls: TrainClass }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-neutral-200/60">
      <div>
        <div className="text-sm font-semibold text-neutral-800">
          {cls.code} <span className="font-normal text-neutral-500">· {cls.name}</span>
        </div>
        <div className="text-xs text-neutral-500">₹{cls.fare.toLocaleString('en-IN')}</div>
      </div>
      <span className={cn('chip', statusStyles[cls.availabilityStatus])}>
        {statusLabel[cls.availabilityStatus]}
        {cls.availabilityStatus === 'AVAILABLE' && cls.availableSeats < 30 && (
          <span className="opacity-70">· {cls.availableSeats}</span>
        )}
      </span>
    </div>
  );
}
