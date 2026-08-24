import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, Database, Gauge, Radio, Ticket, TrainFront, TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/cn';

type Tab = 'overview' | 'trains' | 'stations' | 'instances' | 'bookings' | 'ml';

const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'trains', label: 'Trains', icon: TrainFront },
  { id: 'stations', label: 'Stations', icon: Database },
  { id: 'instances', label: 'Live trains', icon: Radio },
  { id: 'bookings', label: 'Bookings', icon: Ticket },
  { id: 'ml', label: 'ML monitoring', icon: BarChart3 },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');

  const results = useQueries({
    queries: [
      { queryKey: ['admin', 'trains'], queryFn: () => adminApi.trains() },
      { queryKey: ['admin', 'stations'], queryFn: () => adminApi.stations() },
      { queryKey: ['admin', 'instances'], queryFn: () => adminApi.liveInstances() },
      { queryKey: ['admin', 'bookings'], queryFn: () => adminApi.bookings() },
      { queryKey: ['admin', 'ml-metrics'], queryFn: () => adminApi.mlMetrics() },
      { queryKey: ['admin', 'predictions'], queryFn: () => adminApi.predictions(20) },
    ],
  });
  const [trainsR, stationsR, instancesR, bookingsR, metricsR, predictionsR] = results;

  const anyLoading = results.some((r) => r.isLoading);
  const anyError = results.some((r) => r.isError);

  if (anyLoading) return <FullScreenSpinner label="Loading admin dashboard…" />;
  if (anyError) return <ErrorState title="Dashboard unavailable" description="Some admin data failed to load." className="py-20" />;

  const trains = trainsR.data ?? [];
  const stations = stationsR.data ?? [];
  const instances = instancesR.data ?? [];
  const bookings = bookingsR.data ?? [];
  const metrics = metricsR.data;
  const predictions = predictionsR.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-neutral-900">Admin dashboard</h1>
        <span className="chip bg-primary-50 text-primary-700">RailFlow Ops</span>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
              tab === t.id ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={TrainFront} label="Trains" value={trains.length} tone="primary" />
            <StatCard icon={Database} label="Stations" value={stations.length} tone="accent" />
            <StatCard icon={Radio} label="Live trains" value={instances.length} tone="error" />
            <StatCard icon={Ticket} label="Bookings" value={bookings.length} tone="success" />
            {metrics && (
              <>
                <StatCard icon={Activity} label="Predictions" value={metrics.predictionCount.toLocaleString('en-IN')} tone="primary" />
                <StatCard icon={Gauge} label="MAE (min)" value={metrics.mae.toFixed(1)} tone="warning" />
                <StatCard icon={TrendingUp} label="RMSE (min)" value={metrics.rmse.toFixed(1)} tone="accent" />
                <StatCard icon={CheckCircle2} label="ML status" value={metrics.serviceStatus} tone={metrics.serviceStatus === 'ONLINE' ? 'success' : 'error'} />
              </>
            )}
          </div>
        )}

        {tab === 'trains' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-400">
                <tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Classes</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {trains.map((t) => (
                  <tr key={t.trainNumber} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono font-semibold text-primary-700">{t.trainNumber}</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{t.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{t.type}</td>
                    <td className="px-4 py-3 text-neutral-500">{t.originStation.name} → {t.destinationStation.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{t.classes.map((c) => c.code).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'stations' && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((s) => (
              <div key={s.id} className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-800">{s.name}</span>
                  <span className="font-mono text-xs text-neutral-400">{s.code}</span>
                </div>
                {s.state && <div className="text-xs text-neutral-500">{s.state}</div>}
                <div className="mt-1 font-mono text-[10px] text-neutral-400">{s.latitude.toFixed(3)}, {s.longitude.toFixed(3)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'instances' && (
          instances.length === 0 ? (
            <EmptyState icon={<Radio className="h-6 w-6" />} title="No live trains" description="Start a simulation from any tracking page to see live instances here." />
          ) : (
            <div className="space-y-2">
              {instances.map((i) => (
                <div key={i.id} className="card flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      <span className="font-mono">{i.trainNumber}</span> {i.trainName}
                    </div>
                    <div className="text-xs text-neutral-500">{i.originStation.name} → {i.destinationStation.name} · {i.journeyDate}</div>
                  </div>
                  <span className="chip bg-success-50 text-success-700"><span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Running · +{i.currentDelayMinutes}m</span>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'bookings' && (
          bookings.length === 0 ? (
            <EmptyState icon={<Ticket className="h-6 w-6" />} title="No bookings yet" description="Bookings made in the app will appear here." />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-400">
                  <tr><th className="px-4 py-3">PNR</th><th className="px-4 py-3">Train</th><th className="px-4 py-3">Pax</th><th className="px-4 py-3">Fare</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono font-semibold text-neutral-700">{b.pnr}</td>
                      <td className="px-4 py-3 font-mono text-neutral-600">{b.trainNumber}</td>
                      <td className="px-4 py-3 text-neutral-500">{b.passengerCount}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-700">₹{b.totalFare.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={cn('chip', b.status === 'CONFIRMED' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700')}>{b.status}</span></td>
                      <td className="px-4 py-3 text-neutral-500">{b.journeyDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'ml' && metrics && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Activity} label="Prediction count" value={metrics.predictionCount.toLocaleString('en-IN')} tone="primary" />
              <StatCard icon={Gauge} label="MAE" value={`${metrics.mae.toFixed(1)} min`} tone="warning" />
              <StatCard icon={TrendingUp} label="RMSE" value={`${metrics.rmse.toFixed(1)} min`} tone="accent" />
              <StatCard icon={CheckCircle2} label="Service status" value={metrics.serviceStatus} tone={metrics.serviceStatus === 'ONLINE' ? 'success' : 'error'} />
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800">Model version & training</h3>
                <span className="font-mono text-xs text-neutral-400">{metrics.modelVersion}</span>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Last trained {new Date(metrics.lastTrainedAt).toLocaleString('en-IN')}</div>
              {/* Accuracy trend mini-chart */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-neutral-500">MAE trend (14 days)</div>
                <div className="mt-2 flex h-24 items-end gap-1">
                  {metrics.accuracyTrend.map((p) => (
                    <div key={p.date} className="flex-1 rounded-t bg-primary-400/70" style={{ height: `${Math.max(10, 100 - (p.mae - 2) * 30)}%` }} title={`${p.date}: ${p.mae.toFixed(1)}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Prediction history with actual vs predicted */}
            <div className="card overflow-hidden">
              <div className="border-b border-neutral-100 px-4 py-3 text-sm font-bold text-neutral-800">Prediction history — actual vs predicted</div>
              {predictions.length === 0 ? (
                <EmptyState title="No predictions yet" description="Predictions will appear once tracking is active." />
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-400">
                      <tr><th className="px-4 py-3">Train</th><th className="px-4 py-3">Station</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Predicted</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Error</th><th className="px-4 py-3">Conf.</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {predictions.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-mono text-neutral-600">{p.trainNumber}</td>
                          <td className="px-4 py-3 text-neutral-700">{p.stationName}</td>
                          <td className="px-4 py-3 font-mono text-neutral-500">{p.scheduledArrival}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-primary-700">{p.predictedArrival}</td>
                          <td className="px-4 py-3 font-mono text-neutral-600">{p.actualArrival ?? '—'}</td>
                          <td className="px-4 py-3">
                            {p.errorMinutes == null ? <span className="text-neutral-400">—</span> : (
                              <span className={cn('chip', p.errorMinutes <= 3 ? 'bg-success-50 text-success-700' : p.errorMinutes <= 7 ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700')}>{p.errorMinutes}m</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-neutral-500">{Math.round(p.confidence * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string | number; tone: 'primary' | 'accent' | 'success' | 'warning' | 'error' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
  };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</div>
          <div className="text-lg font-bold text-neutral-900">{value}</div>
        </div>
      </div>
    </div>
  );
}
