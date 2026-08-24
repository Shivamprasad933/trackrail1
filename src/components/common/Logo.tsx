import { TrainFront } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
        <TrainFront className="h-5 w-5" />
      </div>
      {showText && (
        <div className="leading-none">
          <div className="text-lg font-bold tracking-tight text-neutral-900">
            Rail<span className="text-primary-600">Flow</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            Live Tracking
          </div>
        </div>
      )}
    </div>
  );
}
