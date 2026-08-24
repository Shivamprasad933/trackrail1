import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { searchStations } from '@/data/stations';
import type { Station } from '@/types';
import { cn } from '@/lib/cn';

export function StationAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'Search station',
  icon,
  autoFocus,
}: {
  label?: string;
  value: Station | null;
  onChange: (s: Station | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState(value ? `${value.name} (${value.code})` : '');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Station[]>([]);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchStations(query, 8));
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (s: Station) => {
    onChange(s);
    setQuery(`${s.name} (${s.code})`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          {icon ?? <MapPin className="h-4 w-4" />}
        </span>
        <input
          className={cn('input pl-9', value && 'pr-9')}
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter' && results[highlight]) {
              e.preventDefault();
              select(results[highlight]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery('');
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-card-hover">
          {results.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => select(s)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                i === highlight ? 'bg-primary-50 text-primary-900' : 'hover:bg-neutral-50'
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-medium text-neutral-800">{s.name}</span>
                {s.state && <span className="text-xs text-neutral-400">{s.state}</span>}
              </span>
              <span className="font-mono text-xs font-semibold text-neutral-500">{s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
