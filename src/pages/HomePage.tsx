import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, History, MapPin, Radio, Repeat, Search, Sparkles, TrainFront } from 'lucide-react';
import { StationAutocomplete } from '@/components/common/StationAutocomplete';
import { POPULAR_ROUTES, getRecentSearches, saveRecentSearch, type RecentSearch } from '@/data/mockApi';
import { searchStations } from '@/data/stations';
import { todayISO, formatTime24 } from '@/lib/format';
import type { Station, TrainClassCode } from '@/types';

const classOptions: { code: TrainClassCode; label: string }[] = [
  { code: 'SL', label: 'Sleeper' },
  { code: '3A', label: 'AC 3 Tier' },
  { code: '2A', label: 'AC 2 Tier' },
  { code: '1A', label: 'AC First' },
  { code: 'CC', label: 'Chair Car' },
  { code: '2S', label: 'Second Sitting' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState<Station | null>(searchStations('', 1)[0] ?? null);
  const [to, setTo] = useState<Station | null>(searchStations('new delhi', 1)[0] ?? null);
  const [date, setDate] = useState(todayISO());
  const [classCode, setClassCode] = useState<TrainClassCode>('3A');
  const recents = useMemo(() => getRecentSearches(), []);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    saveRecentSearch({
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      date,
      classCode,
      at: new Date().toISOString(),
    });
    const params = new URLSearchParams({ from: from.id, to: to.id, date, class: classCode });
    navigate(`/search?${params}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:pt-20">
          <div className="max-w-2xl">
            <span className="chip bg-white/15 text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered live train tracking
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              When will my train <span className="text-accent-300">actually</span> arrive?
            </h1>
            <p className="mt-3 text-base text-white/80">
              Search trains, book tickets, and track them live with arrival predictions that update in real time.
            </p>
          </div>

          {/* Search card */}
          <form onSubmit={submit} className="mt-8 rounded-2xl bg-white p-4 text-neutral-900 shadow-2xl sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
              <StationAutocomplete label="From" value={from} onChange={setFrom} placeholder="Departure station" autoFocus />
              <div className="flex items-end justify-center pb-1">
                <button type="button" onClick={swap} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-primary-50 hover:text-primary-600" aria-label="Swap">
                  <Repeat className="h-4 w-4" />
                </button>
              </div>
              <StationAutocomplete label="To" value={to} onChange={setTo} placeholder="Destination station" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Journey date</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input type="date" className="input pl-9" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Class</label>
                <div className="relative">
                  <TrainFront className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <select className="input pl-9" value={classCode} onChange={(e) => setClassCode(e.target.value as TrainClassCode)}>
                    {classOptions.map((c) => (
                      <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary mt-5 w-full py-3 text-base">
              <Search className="h-5 w-5" /> Search Trains
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Popular routes */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <MapPin className="h-4 w-4 text-primary-600" /> Popular routes
            </h2>
            <div className="mt-3 space-y-2">
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    const f = searchStations(r.fromId, 1)[0];
                    const t = searchStations(r.toId, 1)[0];
                    if (f && t) {
                      setFrom(f);
                      setTo(t);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left shadow-card ring-1 ring-neutral-200/60 transition hover:shadow-card-hover"
                >
                  <span className="text-sm font-medium text-neutral-700">{r.label}</span>
                  <ArrowRight className="h-4 w-4 text-neutral-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <History className="h-4 w-4 text-primary-600" /> Recent searches
            </h2>
            {recents.length === 0 ? (
              <p className="mt-3 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-400">No recent searches yet. Search above to get started.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {recents.map((r: RecentSearch, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const params = new URLSearchParams({ from: r.fromId, to: r.toId, date: r.date, class: r.classCode ?? '3A' });
                      navigate(`/search?${params}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left shadow-card ring-1 ring-neutral-200/60 transition hover:shadow-card-hover"
                  >
                    <div>
                      <div className="text-sm font-medium text-neutral-700">{r.fromName} → {r.toName}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                        <Clock className="h-3 w-3" /> {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tracked trains */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <Radio className="h-4 w-4 text-error-500" /> Track a train
            </h2>
            <p className="mt-3 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
              Search for a train, then tap <span className="font-semibold text-neutral-700">Track</span> on any running train to open the live tracking map.
            </p>
            <div className="mt-3 rounded-xl bg-primary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary-700">Try the demo</div>
              <p className="mt-1 text-sm text-primary-800">Search Mumbai → New Delhi, then track the Rajdhani to see live movement and AI ETA.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
