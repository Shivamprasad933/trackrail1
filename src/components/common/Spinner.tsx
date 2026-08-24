import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 className={cn('animate-spin text-primary-600', className)} style={{ width: size, height: size }} />;
}

export function FullScreenSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-neutral-500">
      <Spinner size={28} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
