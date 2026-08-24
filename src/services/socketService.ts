import { io, type Socket as SocketType } from 'socket.io-client';
import { SOCKET_URL, DEMO_MODE } from '@/lib/env';
import { getSimulationEntry, registerSimulation } from '@/data/mockApi';
import type {
  DelayTrend,
  ETAState,
  Train,
  TrainInstance,
  TrainLocation,
  TrainState,
} from '@/types';

// ============================================================
// Socket events (contract with backend)
// ============================================================
export type TrainEvent =
  | { type: 'train:location'; payload: TrainLocation }
  | { type: 'train:state'; payload: TrainState }
  | { type: 'train:eta'; payload: ETAState }
  | { type: 'train:delay'; payload: { trainInstanceId: string; delayMinutes: number; trend: DelayTrend } }
  | { type: 'train:status'; payload: { trainInstanceId: string; status: TrainInstance['status'] } };

type Listener = (event: TrainEvent) => void;

class SocketService {
  private socket: SocketType | null = null;
  private listeners = new Set<Listener>();
  private joinedRooms = new Set<string>();
  private demoTimers = new Map<string, ReturnType<typeof setInterval>>();
  private demoEntryMap = new Map<string, { train: Train; instance: TrainInstance }>();
  private connected = false;

  connect() {
    if (DEMO_MODE) {
      this.connected = true;
      this.notifyConnect();
      return;
    }
    if (this.socket) return;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    this.socket.on('connect', () => {
      this.connected = true;
      this.notifyConnect();
      // Re-join rooms after reconnect.
      this.joinedRooms.forEach((room) => this.socket?.emit('train:join', room));
    });
    this.socket.on('disconnect', () => {
      this.connected = false;
      this.notifyDisconnect();
    });
    (['train:location', 'train:state', 'train:eta', 'train:delay', 'train:status'] as const).forEach(
      (evt) => {
        this.socket!.on(evt, (payload: unknown) => {
          this.listeners.forEach((l) => l({ type: evt, payload } as TrainEvent));
        });
      }
    );
  }

  disconnect() {
    this.demoTimers.forEach((t) => clearInterval(t));
    this.demoTimers.clear();
    this.demoEntryMap.clear();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  join(trainInstanceId: string, train: Train, instance: TrainInstance) {
    this.joinedRooms.add(trainInstanceId);
    this.demoEntryMap.set(trainInstanceId, { train, instance });
    registerSimulation(trainInstanceId, train, instance);

    if (DEMO_MODE) {
      this.startDemoLoop(trainInstanceId);
    } else if (this.socket) {
      this.socket.emit('train:join', trainInstanceId);
    }
  }

  leave(trainInstanceId: string) {
    this.joinedRooms.delete(trainInstanceId);
    this.demoEntryMap.delete(trainInstanceId);
    const timer = this.demoTimers.get(trainInstanceId);
    if (timer) {
      clearInterval(timer);
      this.demoTimers.delete(trainInstanceId);
    }
    if (!DEMO_MODE && this.socket) {
      this.socket.emit('train:leave', trainInstanceId);
    }
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isConnected() {
    return this.connected;
  }

  private notifyConnect() {
    // Emit a synthetic status so listeners can render a connected state.
  this.listeners.forEach((l) =>
    l({ type: 'train:status', payload: { trainInstanceId: '__system', status: 'RUNNING' } })
  );
  }

  private notifyDisconnect() {
    this.listeners.forEach((l) =>
      l({ type: 'train:status', payload: { trainInstanceId: '__system', status: 'CANCELLED' } })
    );
  }

  // ============================================================
  // Demo simulation loop — emits the same events a real backend would.
  // ============================================================
  private startDemoLoop(trainInstanceId: string) {
    if (this.demoTimers.has(trainInstanceId)) return;
    const entry = getSimulationEntry(trainInstanceId);
    if (!entry) return;
    const tick = 1000; // 1s wall-clock per tick

    const timer = setInterval(() => {
      const e = getSimulationEntry(trainInstanceId);
      if (!e) return;
      if (e.paused) return;
      if (!e.status.isRunning) return;

      // Advance progress. speedKmph scaled to route distance over duration.
      const route = e.train.route;
      const totalKm = route[route.length - 1].distanceKm;
      const stepKm = (e.speedKmph * (tick / 1000) * e.status.speedMultiplier) / 60 / 60;
      e.progress = Math.min(1, e.progress + stepKm / totalKm);

      // Determine current segment between two stations.
      const targetKm = e.progress * totalKm;
      let segIdx = 0;
      for (let i = 0; i < route.length - 1; i++) {
        if (targetKm >= route[i].distanceKm && targetKm <= route[i + 1].distanceKm) {
          segIdx = i;
          break;
        }
      }
      const a = route[segIdx];
      const b = route[segIdx + 1];
      const segT = (targetKm - a.distanceKm) / Math.max(1, b.distanceKm - a.distanceKm);
      const lat = a.station.latitude + (b.station.latitude - a.station.latitude) * segT;
      const lng = a.station.longitude + (b.station.longitude - a.station.longitude) * segT;
      const heading = Math.round((Math.atan2(b.station.latitude - a.station.latitude, b.station.longitude - a.station.longitude) * 180) / Math.PI);

      const location: TrainLocation = {
        trainInstanceId,
        latitude: lat,
        longitude: lng,
        speedKmph: Math.round(e.speedKmph),
        heading,
        currentStationId: segT < 0.04 ? a.stationId : null,
        nextStationId: b.stationId,
        routeProgress: e.progress,
        lastUpdated: new Date().toISOString(),
      };
      this.listeners.forEach((l) => l({ type: 'train:location', payload: location }));

      // Occasionally drift delay down a touch to simulate recovery.
      if (Math.random() < 0.08 && e.delayMinutes > 0) {
        e.delayMinutes = Math.max(0, e.delayMinutes - 1);
      }

      const trend: DelayTrend =
        e.delayMinutes === 0 ? 'STABLE' : e.delayMinutes > 20 ? 'INCREASING' : 'RECOVERING';
      const state: TrainState = {
        trainInstanceId,
        status: e.progress >= 1 ? 'COMPLETED' : 'AT_STATION',
        currentDelayMinutes: e.delayMinutes,
        delayTrend: trend,
        currentStationId: location.currentStationId,
        nextStationId: location.nextStationId,
        routeProgress: e.progress,
        speedKmph: e.speedKmph,
        lastUpdated: location.lastUpdated,
      };
      state.status = location.currentStationId ? 'AT_STATION' : 'RUNNING';
      this.listeners.forEach((l) => l({ type: 'train:state', payload: state }));

      // ETA: shift each upcoming station by current delay.
      const eta = this.buildETA(e.train, e.delayMinutes, e.progress, trend);
      this.listeners.forEach((l) => l({ type: 'train:eta', payload: eta }));

      this.listeners.forEach((l) =>
        l({
          type: 'train:delay',
          payload: { trainInstanceId, delayMinutes: e.delayMinutes, trend },
        })
      );

      if (e.progress >= 1) {
        e.status.isRunning = false;
        this.listeners.forEach((l) =>
          l({ type: 'train:status', payload: { trainInstanceId, status: 'COMPLETED' } })
        );
      }
    }, tick);

    this.demoTimers.set(trainInstanceId, timer);
  }

  private buildETA(train: Train, delayMin: number, progress: number, trend: DelayTrend): ETAState {
    const stations = train.route.map((stop, idx) => {
      const isOrigin = idx === 0;
      const isDest = idx === train.route.length - 1;
      const scheduled = isOrigin ? stop.scheduledDeparture : stop.scheduledArrival;
      const reached = stop.distanceKm / train.route[train.route.length - 1].distanceKm <= progress - 0.01;
      const approaching =
        !reached && stop.distanceKm / train.route[train.route.length - 1].distanceKm <= progress + 0.08;
      const predicted = shiftTime(scheduled, delayMin);
      const lower = shiftTime(predicted, -3);
      const upper = shiftTime(predicted, 4);
      const confidence = Math.max(0.55, 0.97 - idx * 0.025 - delayMin * 0.005);
      return {
        stationId: stop.stationId,
        stationName: stop.station.name,
        scheduledArrival: scheduled,
        predictedArrival: predicted,
        predictedDelayMinutes: delayMin,
        lowerBound: lower,
        upperBound: upper,
        confidence,
        status: reached ? ('REACHED' as const) : approaching ? ('APPROACHING' as const) : ('UPCOMING' as const),
      };
    });
    const dest = stations[stations.length - 1];
    return {
      source: 'AI',
      trend,
      stations,
      destination: {
        stationId: dest.stationId,
        stationName: dest.stationName,
        scheduledArrival: dest.scheduledArrival ?? train.arrivalTime,
        predictedArrival: dest.predictedArrival ?? train.arrivalTime,
        predictedDelayMinutes: delayMin,
        lowerBound: dest.lowerBound ?? train.arrivalTime,
        upperBound: dest.upperBound ?? train.arrivalTime,
        confidence: dest.confidence,
      },
      mlAvailable: true,
      modelVersion: 'railflow-eta-v2.4',
      generatedAt: new Date().toISOString(),
    };
  }
}

function shiftTime(time: string | null, minutes: number): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

export const socketService = new SocketService();
