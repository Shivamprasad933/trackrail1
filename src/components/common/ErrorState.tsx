import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  action,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-error-50 text-error-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      <div className="mt-5 flex gap-2">
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
