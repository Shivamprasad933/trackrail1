import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, TrainFront } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { trainApi } from '@/services/trainApi';
import { searchStations } from '@/data/stations';
import { TrainCard } from '@/components/trains/TrainCard';
import { TrainCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { formatTime24 } from '@/lib/format';
import type { TrainSearchResult } from '@/types';

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromId = params.get('from') ?? '';
  const toId = params.get('to') ?? '';
  const date = params.get('date') ?? '';
  const classCode = params.get('class') ?? undefined;

  const from = searchStations(fromId, 1)[0];
  const to = searchStations(toId, 1)[0];

  const [sort, setSort] = useState<'departure' | 'duration' | 'delay'>('departure');

  const { data, isLoading, isError, refetch } = useQuery<TrainSearchResult[]>({
    queryKey: ['search', fromId, toId, date, classCode],
    queryFn: () => trainApi.search({ fromId, toId, date, classCode }),
    enabled: Boolean(fromId && toId && date),
  });

  const results = (() => {
    if (!data) return data;
    const sorted = [...data];
    if (sort === 'departure') sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    if (sort === 'duration') sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (sort === 'delay') sorted.sort((a, b) => (b.currentDelayMinutes ?? -1) - (a.currentDelayMinutes ?? -1));
    return sorted;
  })();

  if (!fromId || !toId || !date) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<TrainFront className="h-6 w-6" />}
          title="Missing search details"
          description="Pick a from station, to station, and date to search for trains."
          action={<Link to="/" className="btn-primary"><Search className="h-4 w-4" /> Go to search</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-neutral-900">
              {from?.name} → {to?.name}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}
              {classCode && ` · ${classCode}`}
            </div>
          </div>
          <Link to="/" className="btn-secondary shrink-0">
            <SlidersHorizontal className="h-4 w-4" /> Modify
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-700">
          {isLoading ? 'Searching…' : `${results?.length ?? 0} trains found`}
        </h2>
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          Sort by
          <select className="rounded-lg border-0 bg-neutral-100 px-2 py-1.5 text-xs font-medium ring-1 ring-inset ring-neutral-200" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="departure">Departure</option>
            <option value="duration">Duration</option>
            <option value="delay">Delay</option>
          </select>
        </label>
      </div>

      <div className="mt-3 space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <TrainCardSkeleton key={i} />)}
        {isError && <ErrorState title="Search failed" description="We couldn't load trains. Check your connection and try again." onRetry={() => refetch()} />}
        {!isLoading && !isError && results && results.length === 0 && (
          <EmptyState
            icon={<TrainFront className="h-6 w-6" />}
            title="No trains found"
            description="No trains run on this route for the selected date. Try a different date or route."
            action={<Link to="/" className="btn-primary">New search</Link>}
          />
        )}
        {!isLoading && !isError && results && results.map((r) => <TrainCard key={r.trainInstance.id} result={r} />)}
      </div>
    </div>
  );
}
