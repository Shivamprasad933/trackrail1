import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Radio, Wifi, WifiOff } from 'lucide-react';
import { trackingApi } from '@/services/trackingApi';
import { socketService, type TrainEvent } from '@/services/socketService';
import { simulationApi } from '@/services/simulationApi';
import { TrainMap } from '@/components/tracking/TrainMap';
import { ETAHeader } from '@/components/tracking/ETAHeader';
import { NextStationCard } from '@/components/tracking/NextStationCard';
import { DestinationETA } from '@/components/tracking/DestinationETA';
import { RouteTimeline } from '@/components/tracking/RouteTimeline';
import { DelayIndicator } from '@/components/tracking/DelayIndicator';
import { ETAVisualization } from '@/components/tracking/ETAVisualization';
import { SimulationPanel } from '@/components/tracking/SimulationPanel';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { DelayTrend, ETAState, StationETA, Train, TrainInstance, TrainLocation, TrainState } from '@/types';

export default function TrackPage() {
  const { trainInstanceId } = useParams<{ trainInstanceId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as { trainNumber?: string; journeyDate?: string };

  const { data: snapshot, isLoading, isError, refetch } = useQuery({
    queryKey: ['tracking', trainInstanceId],
    queryFn: () => trackingApi.getSnapshot(trainInstanceId!),
    enabled: Boolean(trainInstanceId),
  });

  const [trainLocation, setTrainLocation] = useState<TrainLocation | null>(null);
  const [trainState, setTrainState] = useState<TrainState | null>(null);
  const [eta, setEta] = useState<ETAState | null>(null);
  const [trend, setTrend] = useState<DelayTrend>('STABLE');
  const [connected, setConnected] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);

  // Seed initial state from the snapshot, then join the socket room.
  useEffect(() => {
    if (!snapshot) return;
    setEta(snapshot.eta);
    setTrainState(snapshot.state);
    setTrainLocation(snapshot.location);
    socketService.connect();
    socketService.join(trainInstanceId!, snapshot.train, snapshot.trainInstance);
    return () => {
      socketService.leave(trainInstanceId!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.trainInstance.id]);

  // Subscribe to live events.
  useEffect(() => {
    const off = socketService.on((event: TrainEvent) => {
      if (event.type === 'train:location') {
        if (event.payload.trainInstanceId === trainInstanceId || event.payload.trainInstanceId === '__system') {
          if (event.payload.trainInstanceId !== '__system') setTrainLocation(event.payload);
        }
      } else if (event.type === 'train:state') {
        if (event.payload.trainInstanceId === trainInstanceId) {
          setTrainState(event.payload);
          setConnected(true);
        }
      } else if (event.type === 'train:eta') {
        if (event.payload.stations.length > 0) setEta(event.payload);
      } else if (event.type === 'train:delay') {
        if (event.payload.trainInstanceId === trainInstanceId) setTrend(event.payload.trend);
      } else if (event.type === 'train:status') {
        if (event.payload.trainInstanceId === '__system') {
          setConnected(event.payload.status === 'RUNNING');
        }
      }
    });
    return off;
  }, [trainInstanceId]);

  // Auto-start the simulation so the demo moves on first visit.
  useEffect(() => {
    if (!snapshot) return;
    simulationApi.status(trainInstanceId!).then((s) => {
      if (!s.isRunning) simulationApi.start(trainInstanceId!).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.trainInstance.id]);

  if (isLoading) return <FullScreenSpinner label="Connecting to live tracking…" />;
  if (isError || !snapshot) return <ErrorState title="Location unavailable" description="We couldn't load this train's tracking data." onRetry={() => refetch()} className="py-20" />;

  const { train, trainInstance } = snapshot;
  const nextStation = eta?.stations.find((s) => s.status === 'UPCOMING' || s.status === 'APPROACHING') ?? null;
  const mlAvailable = eta?.mlAvailable ?? false;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-neutral-950 lg:flex-row">
      {/* Map — full screen on mobile, left pane on desktop */}
      <div className="relative flex-1">
        <TrainMap train={train} location={trainLocation} nextStationId={trainLocation?.nextStationId ?? trainState?.nextStationId ?? null} className="h-full" />
        {/* Connection indicator */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold backdrop-blur ${connected ? 'bg-success-500/20 text-success-300' : 'bg-error-500/20 text-error-300'}`}>
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? 'Live' : 'Reconnecting'}
          </span>
        </div>
      </div>

      {/* Desktop side panel */}
      <aside className="hidden w-[420px] shrink-0 overflow-y-auto bg-neutral-50 p-4 lg:block">
        <TrackContent
          trainInstance={trainInstance}
          trainState={trainState}
          eta={eta}
          trend={trend}
          mlAvailable={mlAvailable}
          trainInstanceId={trainInstanceId!}
          nextStation={nextStation}
          train={train}
          trainLocation={trainLocation}
        />
      </aside>

      {/* Mobile bottom sheet */}
      <div className="lg:hidden">
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
          <div className={`pointer-events-auto rounded-t-2xl bg-neutral-50 shadow-panel transition-transform duration-300 ${sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}`}>
            <button onClick={() => setSheetOpen((o) => !o)} className="flex w-full items-center justify-center py-2" aria-label="Toggle panel">
              <span className="h-1.5 w-10 rounded-full bg-neutral-300" />
            </button>
            <div className="flex items-center justify-between px-4 pb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"><Radio className="h-3.5 w-3.5 text-error-500" /> Live tracking</span>
              {sheetOpen ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronUp className="h-4 w-4 text-neutral-400" />}
            </div>
            {sheetOpen && (
              <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 safe-bottom">
                <TrackContent
                  trainInstance={trainInstance}
                  trainState={trainState}
                  eta={eta}
                  trend={trend}
                  mlAvailable={mlAvailable}
                  trainInstanceId={trainInstanceId!}
                  nextStation={nextStation}
                  train={train}
                  trainLocation={trainLocation}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackContent({
  trainInstance,
  trainState,
  eta,
  trend,
  mlAvailable,
  trainInstanceId,
  nextStation,
  train,
  trainLocation,
}: {
  trainInstance: TrainInstance;
  trainState: TrainState | null;
  eta: ETAState | null;
  trend: DelayTrend;
  mlAvailable: boolean;
  trainInstanceId: string;
  nextStation: StationETA | null;
  train: Train;
  trainLocation: TrainLocation | null;
}) {
  const delay = trainState?.currentDelayMinutes ?? trainInstance.currentDelayMinutes;
  return (
    <div className="space-y-3">
      <ETAHeader trainInstance={trainInstance} state={trainState} />

      <DelayIndicator trend={trainState?.delayTrend ?? trend} delayMinutes={delay} />

      {/* ML availability banner */}
      {!mlAvailable && (
        <div className="rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-800 ring-1 ring-warning-200">
          <div className="font-semibold">AI ETA temporarily unavailable</div>
          <div className="text-xs text-warning-700">Showing the scheduled arrival as a fallback. Predictions will resume shortly.</div>
        </div>
      )}

      {nextStation && <NextStationCard eta={nextStation} />}
      {eta && <DestinationETA eta={eta.destination} />}

      {eta && <ETAVisualization eta={eta} />}
      {eta && trainLocation && <RouteTimeline eta={eta} location={trainLocation} />}

      <SimulationPanel trainInstanceId={trainInstanceId} />

      <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
        <span>Train {train.trainNumber} · {train.distanceKm} km</span>
        <Link to={`/trains/${train.trainNumber}`} className="font-medium text-primary-600 hover:underline">View details</Link>
      </div>
    </div>
  );
}
