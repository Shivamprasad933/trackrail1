import type {
  AdminBooking,
  Booking,
  ETAState,
  MLMetrics,
  PredictionRecord,
  SimulationEventType,
  SimulationStatus,
  Train,
  TrainClass,
  TrainInstance,
  TrainSearchResult,
  User,
} from '@/types';
import { findTrainsBetween, trainByNumber, TRAINS } from './trains';
import { stationById, STATIONS } from './stations';

// ============================================================
// Utilities
// ============================================================
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.floor((Math.random() - 0.5) * spread);
const todayISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const pnr = () => String(10_000_000 + Math.floor(Math.random() * 89_999_999));

const ADMIN_USER: User = {
  id: 'usr_admin',
  name: 'Aarav Mehta',
  email: 'admin@railflow.in',
  phone: '+91 98200 11223',
  role: 'admin',
};
const DEMO_USER: User = {
  id: 'usr_demo',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '+91 98765 43210',
  role: 'user',
};

const USERS: Record<string, { user: User; password: string }> = {
  'priya@example.com': { user: DEMO_USER, password: 'demo123' },
  'admin@railflow.in': { user: ADMIN_USER, password: 'admin123' },
};

const BOOKINGS: Booking[] = [];

// ============================================================
// Auth
// ============================================================
export async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  await wait(420);
  const rec = USERS[email.toLowerCase()];
  if (!rec || rec.password !== password) {
    const err = new Error('Invalid email or password') as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return { user: rec.user, token: `mock.${btoa(rec.user.id)}.${Date.now()}` };
}

export async function mockRegister(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  await wait(520);
  if (USERS[email.toLowerCase()]) {
    const err = new Error('An account with this email already exists') as Error & { status?: number };
    err.status = 409;
    throw err;
  }
  const user: User = { id: uid('usr'), name, email, role: 'user' };
  USERS[email.toLowerCase()] = { user, password };
  return { user, token: `mock.${btoa(user.id)}.${Date.now()}` };
}

// ============================================================
// Trains
// ============================================================
export async function mockSearchTrains(
  fromId: string,
  toId: string,
  date: string,
  _classCode?: string
): Promise<TrainSearchResult[]> {
  await wait(jitter(620, 240));
  const trains = findTrainsBetween(fromId, toId);
  if (trains.length === 0) return [];

  const from = stationById(fromId)!;
  const to = stationById(toId)!;

  return trains.map((train) => {
    const fromIdx = train.route.findIndex((r) => r.stationId === fromId);
    const toIdx = train.route.findIndex((r) => r.stationId === toId);
    const slice = train.route.slice(fromIdx, toIdx + 1);
    const dep = slice[0].scheduledDeparture ?? train.departureTime;
    const arr = slice[slice.length - 1].scheduledArrival ?? train.arrivalTime;
    const duration = train.durationMinutes;
    const runningToday = train.runsOnDays.includes(new Date(date).getDay());

    const instance: TrainInstance = {
      id: uid('ti'),
      trainNumber: train.trainNumber,
      trainName: train.name,
      journeyDate: date,
      status: runningToday ? 'RUNNING' : 'SCHEDULED',
      currentDelayMinutes: runningToday ? jitter(6, 24) : 0,
      originStation: from,
      destinationStation: to,
      departureTime: dep,
      arrivalTime: arr,
      isTrackingActive: runningToday,
    };

    const classes: TrainClass[] = train.classes.map((c) => ({
      ...c,
      availableSeats: Math.max(0, c.availableSeats - Math.floor(Math.random() * 20)),
      availabilityStatus:
        c.availableSeats === 0
          ? 'REGRET'
          : c.availableSeats < 10
          ? 'WL'
          : c.availableSeats < 30
          ? 'RAC'
          : 'AVAILABLE',
    }));

    return {
      trainInstance: instance,
      train,
      fromStation: from,
      toStation: to,
      departureTime: dep,
      arrivalTime: arr,
      durationMinutes: duration,
      availableClasses: classes,
      currentDelayMinutes: runningToday ? instance.currentDelayMinutes : null,
    };
  });
}

export async function mockGetTrain(trainNumber: string): Promise<Train> {
  await wait(360);
  const t = trainByNumber(trainNumber);
  if (!t) {
    const err = new Error('Train not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return t;
}

export async function mockGetTrainInstance(trainNumber: string, date: string): Promise<TrainInstance> {
  await wait(280);
  const t = trainByNumber(trainNumber);
  if (!t) {
    const err = new Error('Train not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const runningToday = t.runsOnDays.includes(new Date(date).getDay());
  return {
    id: uid('ti'),
    trainNumber: t.trainNumber,
    trainName: t.name,
    journeyDate: date,
    status: runningToday ? 'RUNNING' : 'SCHEDULED',
    currentDelayMinutes: runningToday ? jitter(8, 18) : 0,
    originStation: t.originStation,
    destinationStation: t.destinationStation,
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    isTrackingActive: runningToday,
  };
}

// ============================================================
// Booking
// ============================================================
export async function mockFareQuote(
  trainInstanceId: string,
  classCode: string,
  passengerCount: number
): Promise<{ fare: Booking['fare']; classCode: string; className: string }> {
  await wait(480);
  // Derive train number from instance id pattern isn't reliable; use a lookup map instead.
  const train = TRAINS.find((t) => t.classes.some((c) => c.code === classCode));
  const cls = train?.classes.find((c) => c.code === classCode);
  if (!cls) {
    const err = new Error('Class not available') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const base = cls.fare * passengerCount;
  const reservation = 40 * passengerCount;
  const superfast = 45 * passengerCount;
  const catering = train?.type === 'Rajdhani' || train?.type === 'Duronto' ? 220 * passengerCount : 0;
  const gst = Math.round((base + reservation) * 0.05);
  return {
    fare: {
      baseFare: base,
      reservationCharge: reservation,
      superfastCharge: superfast,
      cateringCharge: catering,
      gst,
      total: base + reservation + superfast + catering + gst,
    },
    classCode: cls.code,
    className: cls.name,
  };
}

export async function mockCreateBooking(input: {
  trainInstanceId: string;
  trainNumber: string;
  classCode: string;
  journeyDate: string;
  fromStationId: string;
  toStationId: string;
  passengers: { name: string; age: number; gender: 'M' | 'F' | 'O'; berthPreference: string }[];
}): Promise<Booking> {
  await wait(jitter(900, 400));
  const train = trainByNumber(input.trainNumber);
  if (!train) {
    const err = new Error('Train unavailable') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const cls = train.classes.find((c) => c.code === input.classCode)!;
  const from = stationById(input.fromStationId)!;
  const to = stationById(input.toStationId)!;
  const { fare } = await mockFareQuote(input.trainInstanceId, input.classCode, input.passengers.length);

  const coach = `${cls.code}1`;
  const seats = input.passengers.map((_, i) => `${cls.code === '1A' ? 'A' : cls.code === '2A' ? 'A' : 'B'}${10 + i}${i % 2 === 0 ? 'LB' : 'UB'}`);

  const booking: Booking = {
    id: uid('bk'),
    pnr: pnr(),
    trainNumber: train.trainNumber,
    trainName: train.name,
    trainInstanceId: input.trainInstanceId,
    journeyDate: input.journeyDate,
    fromStation: from,
    toStation: to,
    classCode: cls.code,
    className: cls.name,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    passengers: input.passengers.map((p, i) => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      bookingStatus: 'CNF' as const,
      coach,
      seat: seats[i],
    })),
    fare,
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString(),
    coach,
    seats,
    qrPayload: `RAILFLOW|${pnr()}|${train.trainNumber}|${input.journeyDate}|${from.code}|${to.code}|${cls.code}`,
  };
  BOOKINGS.push(booking);
  return booking;
}

export async function mockGetBooking(id: string): Promise<Booking> {
  await wait(280);
  const b = BOOKINGS.find((x) => x.id === id);
  if (!b) {
    const err = new Error('Booking not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return b;
}

export async function mockGetMyBookings(userId: string): Promise<Booking[]> {
  await wait(420);
  // In the mock, all bookings belong to the demo user.
  void userId;
  return [...BOOKINGS].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));
}

export async function mockCancelBooking(id: string): Promise<Booking> {
  await wait(620);
  const b = BOOKINGS.find((x) => x.id === id);
  if (!b) {
    const err = new Error('Booking not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  b.status = 'CANCELLED';
  b.passengers = b.passengers.map((p) => ({ ...p, bookingStatus: 'CNF' }));
  return b;
}

// ============================================================
// Tracking & ETA
// ============================================================
export async function mockGetTrackingSnapshot(trainInstanceId: string): Promise<{
  trainInstance: TrainInstance;
  train: Train;
  eta: ETAState;
}> {
  await wait(jitter(520, 200));
  // For the mock, we resolve the train by scanning known instances created during search.
  // The simulation engine keeps a registry; if not found, fall back to 12951.
  const sim = getSimulationRegistry();
  const entry = sim[trainInstanceId];
  const train = entry?.train ?? TRAINS[0];
  const instance = entry?.instance ?? {
    id: trainInstanceId,
    trainNumber: train.trainNumber,
    trainName: train.name,
    journeyDate: todayISO(),
    status: 'RUNNING' as const,
    currentDelayMinutes: 8,
    originStation: train.originStation,
    destinationStation: train.destinationStation,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    isTrackingActive: true,
  };
  return { trainInstance: instance, train, eta: buildInitialETA(train, instance.currentDelayMinutes) };
}

function buildInitialETA(train: Train, delayMin: number): ETAState {
  const stations = train.route.map((stop, idx) => {
    const isOrigin = idx === 0;
    const isDest = idx === train.route.length - 1;
    const scheduled = isOrigin ? stop.scheduledDeparture : stop.scheduledArrival;
    const predicted = shiftTime(scheduled, delayMin);
    const lower = shiftTime(predicted, -3);
    const upper = shiftTime(predicted, 4);
    return {
      stationId: stop.stationId,
      stationName: stop.station.name,
      scheduledArrival: scheduled,
      predictedArrival: predicted,
      predictedDelayMinutes: delayMin,
      lowerBound: lower,
      upperBound: upper,
      confidence: Math.max(0.6, 0.97 - idx * 0.03 - delayMin * 0.004),
      status: (isOrigin ? 'REACHED' : isDest ? 'UPCOMING' : 'UPCOMING') as 'REACHED' | 'UPCOMING',
    };
  });
  const dest = stations[stations.length - 1];
  return {
    source: 'AI',
    trend: delayMin > 15 ? 'INCREASING' : delayMin > 5 ? 'MAINTAINING' : 'STABLE',
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

function shiftTime(time: string | null, minutes: number): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// ============================================================
// Simulation registry — shared with socketService for live updates
// ============================================================
interface SimEntry {
  train: Train;
  instance: TrainInstance;
  status: SimulationStatus;
  progress: number; // 0..1 along route
  delayMinutes: number;
  speedKmph: number;
  paused: boolean;
}
const SIM_REGISTRY: Record<string, SimEntry> = {};

export function registerSimulation(trainInstanceId: string, train: Train, instance: TrainInstance) {
  if (!SIM_REGISTRY[trainInstanceId]) {
    SIM_REGISTRY[trainInstanceId] = {
      train,
      instance,
      status: { isRunning: false, isPaused: false, speedMultiplier: 1, trainInstanceId },
      progress: 0.18,
      delayMinutes: instance.currentDelayMinutes,
      speedKmph: 72,
      paused: false,
    };
  } else {
    SIM_REGISTRY[trainInstanceId].train = train;
    SIM_REGISTRY[trainInstanceId].instance = instance;
  }
}

export function getSimulationRegistry(): Record<string, SimEntry> {
  return SIM_REGISTRY;
}

export function getSimulationEntry(trainInstanceId: string): SimEntry | undefined {
  return SIM_REGISTRY[trainInstanceId];
}

export function startSimulation(trainInstanceId: string) {
  const e = SIM_REGISTRY[trainInstanceId];
  if (!e) return;
  e.status.isRunning = true;
  e.status.isPaused = false;
  e.paused = false;
  e.status.lastEvent = undefined;
}

export function pauseSimulation(trainInstanceId: string) {
  const e = SIM_REGISTRY[trainInstanceId];
  if (!e) return;
  e.status.isPaused = true;
  e.paused = true;
}

export function resetSimulation(trainInstanceId: string) {
  const e = SIM_REGISTRY[trainInstanceId];
  if (!e) return;
  e.progress = 0;
  e.delayMinutes = 0;
  e.speedKmph = 72;
  e.status.isRunning = false;
  e.status.isPaused = false;
  e.paused = false;
  e.status.lastEvent = 'RESET';
  e.status.lastEventAt = new Date().toISOString();
}

export function applySimulationEvent(trainInstanceId: string, event: SimulationEventType) {
  const e = SIM_REGISTRY[trainInstanceId];
  if (!e) return;
  switch (event) {
    case 'ADD_DELAY_5':
      e.delayMinutes += 5;
      break;
    case 'ADD_DELAY_15':
      e.delayMinutes += 15;
      break;
    case 'HEAVY_CONGESTION':
      e.delayMinutes += 12;
      e.speedKmph = Math.max(20, e.speedKmph - 30);
      break;
    case 'SPEED_RESTRICTION':
      e.speedKmph = Math.max(15, e.speedKmph - 25);
      e.delayMinutes += 6;
      break;
    case 'LONG_STATION_HALT':
      e.delayMinutes += 8;
      break;
    case 'RECOVER_DELAY':
      e.delayMinutes = Math.max(0, e.delayMinutes - 10);
      break;
    case 'RESET':
      resetSimulation(trainInstanceId);
      return;
  }
  e.status.lastEvent = event;
  e.status.lastEventAt = new Date().toISOString();
}

export async function mockSimulationStart(trainInstanceId: string): Promise<SimulationStatus> {
  await wait(180);
  startSimulation(trainInstanceId);
  return getSimulationEntry(trainInstanceId)!.status;
}
export async function mockSimulationPause(trainInstanceId: string): Promise<SimulationStatus> {
  await wait(120);
  pauseSimulation(trainInstanceId);
  return getSimulationEntry(trainInstanceId)!.status;
}
export async function mockSimulationReset(trainInstanceId: string): Promise<SimulationStatus> {
  await wait(120);
  resetSimulation(trainInstanceId);
  return getSimulationEntry(trainInstanceId)!.status;
}
export async function mockSimulationEvent(
  trainInstanceId: string,
  event: SimulationEventType
): Promise<SimulationStatus> {
  await wait(140);
  applySimulationEvent(trainInstanceId, event);
  return getSimulationEntry(trainInstanceId)!.status;
}
export async function mockSimulationStatus(trainInstanceId: string): Promise<SimulationStatus> {
  await wait(80);
  return getSimulationEntry(trainInstanceId)?.status ?? {
    isRunning: false,
    isPaused: false,
    speedMultiplier: 1,
    trainInstanceId,
  };
}

// ============================================================
// Admin
// ============================================================
export async function mockAdminBookings(): Promise<AdminBooking[]> {
  await wait(420);
  return BOOKINGS.map((b) => ({
    id: b.id,
    pnr: b.pnr,
    trainNumber: b.trainNumber,
    passengerCount: b.passengers.length,
    totalFare: b.fare.total,
    status: b.status,
    journeyDate: b.journeyDate,
    bookedAt: b.bookedAt,
  }));
}

export async function mockAdminTrains(): Promise<Train[]> {
  await wait(300);
  return TRAINS;
}

export async function mockAdminStations() {
  await wait(260);
  return STATIONS;
}

export async function mockAdminLiveInstances(): Promise<TrainInstance[]> {
  await wait(380);
  return Object.values(SIM_REGISTRY)
    .filter((e) => e.status.isRunning)
    .map((e) => ({ ...e.instance, status: 'RUNNING', currentDelayMinutes: e.delayMinutes }));
}

const METRICS: MLMetrics = {
  modelVersion: 'railflow-eta-v2.4',
  predictionCount: 184_512,
  mae: 3.8,
  rmse: 6.1,
  serviceStatus: 'ONLINE',
  lastTrainedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  accuracyTrend: Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { date: d.toISOString().slice(0, 10), mae: 3.2 + Math.sin(i / 2) * 0.9 + Math.random() * 0.6 };
  }),
};

export async function mockMLMetrics(): Promise<MLMetrics> {
  await wait(360);
  return { ...METRICS, predictionCount: METRICS.predictionCount + Math.floor(Math.random() * 50) };
}

export async function mockPredictions(limit = 20): Promise<PredictionRecord[]> {
  await wait(440);
  const records: PredictionRecord[] = [];
  for (let i = 0; i < limit; i++) {
    const train = TRAINS[i % TRAINS.length];
    const stop = train.route[Math.floor(Math.random() * train.route.length)];
    const scheduled = stop.scheduledArrival ?? stop.scheduledDeparture ?? '12:00';
    const predictedArrival = shiftTime(scheduled, Math.floor(Math.random() * 18))!;
    const actual: string | null = i % 3 === 0 ? null : shiftTime(predictedArrival, Math.floor((Math.random() - 0.5) * 8));
    const err = actual ? Math.abs(timeDiffMin(actual, scheduled) - timeDiffMin(predictedArrival, scheduled)) : null;
    records.push({
      id: uid('pred'),
      trainInstanceId: uid('ti'),
      trainNumber: train.trainNumber,
      stationName: stop.station.name,
      scheduledArrival: scheduled,
      predictedArrival,
      actualArrival: actual,
      errorMinutes: err,
      confidence: 0.7 + Math.random() * 0.28,
      modelVersion: METRICS.modelVersion,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 23).toISOString(),
    });
  }
  return records;
}

function timeDiffMin(a: string, b: string): number {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return ah * 60 + am - (bh * 60 + bm);
}

// ============================================================
// Recent searches (localStorage-backed)
// ============================================================
export interface RecentSearch {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  date: string;
  classCode?: string;
  at: string;
}

export function getRecentSearches(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem('railflow:recent') ?? '[]');
  } catch {
    return [];
  }
}

export function saveRecentSearch(s: RecentSearch) {
  const list = getRecentSearches().filter((x) => !(x.fromId === s.fromId && x.toId === s.toId));
  list.unshift(s);
  localStorage.setItem('railflow:recent', JSON.stringify(list.slice(0, 5)));
}

export const POPULAR_ROUTES: { fromId: string; toId: string; label: string }[] = [
  { fromId: 'st_mmc', toId: 'st_ndls', label: 'Mumbai → New Delhi' },
  { fromId: 'st_ndls', toId: 'st_mmc', label: 'New Delhi → Mumbai' },
  { fromId: 'st_mmc', toId: 'st_adi', label: 'Mumbai → Ahmedabad' },
  { fromId: 'st_hwh', toId: 'st_ndls', label: 'Howrah → New Delhi' },
  { fromId: 'st_sbc', toId: 'st_sc', label: 'Bengaluru → Secunderabad' },
  { fromId: 'st_ndls', toId: 'st_ngp', label: 'New Delhi → Nagpur' },
];
