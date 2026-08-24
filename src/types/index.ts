// ============================================================
// Domain types — shared across the app.
// The backend owns business logic; these types only describe
// the shapes the frontend renders.
// ============================================================

export type TrainClassCode = 'SL' | '3A' | '2A' | '1A' | 'CC' | '2S' | 'EC';

export interface TrainClass {
  code: TrainClassCode;
  name: string;
  fare: number;
  availableSeats: number;
  totalSeats: number;
  availabilityStatus: 'AVAILABLE' | 'RAC' | 'WL' | 'REGRET';
}

export interface Station {
  id: string;
  code: string;
  name: string;
  state?: string;
  latitude: number;
  longitude: number;
  platform?: string;
}

export interface RouteStop {
  stationId: string;
  station: Station;
  sequence: number;
  distanceKm: number;
  scheduledArrival: string | null; // "HH:mm" or null at origin
  scheduledDeparture: string | null; // null at destination
  haltMinutes: number;
  platform?: string;
  dayOfJourney: number;
}

export interface Train {
  trainNumber: string;
  name: string;
  operator: string;
  type: 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Express' | 'Superfast' | 'Vande Bharat';
  originStation: Station;
  destinationStation: Station;
  classes: TrainClass[];
  route: RouteStop[];
  runsOnDays: number[]; // 0..6 (Sun..Sat)
  durationMinutes: number;
  distanceKm: number;
  departureTime: string; // "HH:mm"
  arrivalTime: string;
}

export type TrainInstanceStatus =
  | 'SCHEDULED'
  | 'RUNNING'
  | 'AT_STATION'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TrainInstance {
  id: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string; // ISO date
  status: TrainInstanceStatus;
  currentDelayMinutes: number;
  originStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  isTrackingActive: boolean;
}

export interface TrainSearchResult {
  trainInstance: TrainInstance;
  train: Train;
  fromStation: Station;
  toStation: Station;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  availableClasses: TrainClass[];
  currentDelayMinutes: number | null;
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference: 'LB' | 'UB' | 'MB' | 'SL' | 'SU' | 'NO';
  nationality: string;
  isPrimary: boolean;
}

export interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  cateringCharge: number;
  gst: number;
  total: number;
}

export interface Booking {
  id: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  trainInstanceId: string;
  journeyDate: string;
  fromStation: Station;
  toStation: Station;
  classCode: TrainClassCode;
  className: string;
  departureTime: string;
  arrivalTime: string;
  passengers: BookingPassenger[];
  fare: FareBreakdown;
  status: 'CONFIRMED' | 'RAC' | 'WAITLIST' | 'CANCELLED';
  bookedAt: string;
  coach?: string;
  seats?: string[];
  qrPayload?: string;
}

export interface BookingPassenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  bookingStatus: 'CNF' | 'RAC' | 'WL';
  coach?: string;
  seat?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

// ============================================================
// Tracking & ETA
// ============================================================

export type DelayTrend = 'RECOVERING' | 'MAINTAINING' | 'INCREASING' | 'STABLE';

export interface TrainLocation {
  trainInstanceId: string;
  latitude: number;
  longitude: number;
  speedKmph: number;
  heading: number;
  currentStationId: string | null;
  nextStationId: string | null;
  routeProgress: number; // 0..1
  lastUpdated: string; // ISO
}

export interface TrainState {
  trainInstanceId: string;
  status: TrainInstanceStatus;
  currentDelayMinutes: number;
  delayTrend: DelayTrend;
  currentStationId: string | null;
  nextStationId: string | null;
  routeProgress: number;
  speedKmph: number;
  lastUpdated: string;
}

export interface StationETA {
  stationId: string;
  stationName: string;
  scheduledArrival: string | null;
  predictedArrival: string | null; // "HH:mm"
  predictedDelayMinutes: number;
  lowerBound: string | null; // "HH:mm"
  upperBound: string | null; // "HH:mm"
  confidence: number; // 0..1
  status: 'REACHED' | 'APPROACHING' | 'UPCOMING' | 'SKIPPED';
}

export interface ETAState {
  source: 'AI' | 'FALLBACK' | 'SCHEDULE';
  trend: DelayTrend;
  stations: StationETA[];
  destination: {
    stationId: string;
    stationName: string;
    scheduledArrival: string;
    predictedArrival: string;
    predictedDelayMinutes: number;
    lowerBound: string;
    upperBound: string;
    confidence: number;
  };
  mlAvailable: boolean;
  modelVersion?: string;
  generatedAt: string;
}

export interface TrackingSnapshot {
  trainInstance: TrainInstance;
  train: Train;
  location: TrainLocation | null;
  state: TrainState | null;
  eta: ETAState | null;
}

// ============================================================
// Simulation
// ============================================================

export type SimulationEventType =
  | 'ADD_DELAY_5'
  | 'ADD_DELAY_15'
  | 'HEAVY_CONGESTION'
  | 'SPEED_RESTRICTION'
  | 'LONG_STATION_HALT'
  | 'RECOVER_DELAY'
  | 'RESET';

export interface SimulationStatus {
  isRunning: boolean;
  isPaused: boolean;
  speedMultiplier: number;
  trainInstanceId: string;
  lastEvent?: SimulationEventType;
  lastEventAt?: string;
}

// ============================================================
// Admin / ML monitoring
// ============================================================

export interface MLMetrics {
  modelVersion: string;
  predictionCount: number;
  mae: number; // mean absolute error (minutes)
  rmse: number;
  serviceStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastTrainedAt: string;
  accuracyTrend: { date: string; mae: number }[];
}

export interface PredictionRecord {
  id: string;
  trainInstanceId: string;
  trainNumber: string;
  stationName: string;
  scheduledArrival: string;
  predictedArrival: string;
  actualArrival: string | null;
  errorMinutes: number | null;
  confidence: number;
  modelVersion: string;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  pnr: string;
  trainNumber: string;
  passengerCount: number;
  totalFare: number;
  status: Booking['status'];
  journeyDate: string;
  bookedAt: string;
}

// ============================================================
// API helpers
// ============================================================
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
