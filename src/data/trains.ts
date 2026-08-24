import type { RouteStop, Train, TrainClass } from '@/types';
import { stationById } from './stations';

const classFactory = (
  code: TrainClass['code'],
  name: string,
  fare: number,
  available: number,
  total: number,
  status: TrainClass['availabilityStatus'] = 'AVAILABLE'
): TrainClass => ({ code, name, fare, availableSeats: available, totalSeats: total, availabilityStatus: status });

// 12951 Rajdhani Express — Mumbai Central → New Delhi
const rajdhaniRoute: RouteStop[] = [
  { stationId: 'st_mmc', station: stationById('st_mmc')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '16:35', haltMinutes: 0, platform: 'PF1', dayOfJourney: 1 },
  { stationId: 'st_bct', station: stationById('st_bct')!, sequence: 2, distanceKm: 30, scheduledArrival: '16:55', scheduledDeparture: '16:57', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_st', station: stationById('st_st')!, sequence: 3, distanceKm: 263, scheduledArrival: '20:02', scheduledDeparture: '20:05', haltMinutes: 3, dayOfJourney: 1 },
  { stationId: 'st_brc', station: stationById('st_brc')!, sequence: 4, distanceKm: 392, scheduledArrival: '22:08', scheduledDeparture: '22:13', haltMinutes: 5, dayOfJourney: 1 },
  { stationId: 'st_adi', station: stationById('st_adi')!, sequence: 5, distanceKm: 491, scheduledArrival: '23:35', scheduledDeparture: '23:45', haltMinutes: 10, dayOfJourney: 1 },
  { stationId: 'st_rtm', station: stationById('st_rtm')!, sequence: 6, distanceKm: 649, scheduledArrival: '02:18', scheduledDeparture: '02:23', haltMinutes: 5, dayOfJourney: 2 },
  { stationId: 'st_kota', station: stationById('st_kota')!, sequence: 7, distanceKm: 922, scheduledArrival: '05:55', scheduledDeparture: '06:00', haltMinutes: 5, dayOfJourney: 2 },
  { stationId: 'st_swm', station: stationById('st_swm')!, sequence: 8, distanceKm: 1001, scheduledArrival: '06:38', scheduledDeparture: '06:40', haltMinutes: 2, dayOfJourney: 2 },
  { stationId: 'st_math', station: stationById('st_math')!, sequence: 9, distanceKm: 1305, scheduledArrival: '09:42', scheduledDeparture: '09:44', haltMinutes: 2, dayOfJourney: 2 },
  { stationId: 'st_ndls', station: stationById('st_ndls')!, sequence: 10, distanceKm: 1384, scheduledArrival: '10:15', scheduledDeparture: null, haltMinutes: 0, platform: 'PF2', dayOfJourney: 2 },
];

// 12009 Shatabdi Express — Mumbai Central → Ahmedabad (day train)
const shatabdiRoute: RouteStop[] = [
  { stationId: 'st_mmc', station: stationById('st_mmc')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '06:25', haltMinutes: 0, platform: 'PF1', dayOfJourney: 1 },
  { stationId: 'st_bct', station: stationById('st_bct')!, sequence: 2, distanceKm: 30, scheduledArrival: '06:46', scheduledDeparture: '06:48', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_st', station: stationById('st_st')!, sequence: 3, distanceKm: 263, scheduledArrival: '09:32', scheduledDeparture: '09:35', haltMinutes: 3, dayOfJourney: 1 },
  { stationId: 'st_brc', station: stationById('st_brc')!, sequence: 4, distanceKm: 392, scheduledArrival: '11:24', scheduledDeparture: '11:29', haltMinutes: 5, dayOfJourney: 1 },
  { stationId: 'st_annd', station: stationById('st_annd')!, sequence: 5, distanceKm: 425, scheduledArrival: '11:58', scheduledDeparture: '12:00', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_adi', station: stationById('st_adi')!, sequence: 6, distanceKm: 491, scheduledArrival: '13:05', scheduledDeparture: null, haltMinutes: 0, platform: 'PF3', dayOfJourney: 1 },
];

// 12259 Duronto — Howrah → New Delhi
const durontoRoute: RouteStop[] = [
  { stationId: 'st_hwh', station: stationById('st_hwh')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '20:05', haltMinutes: 0, platform: 'PF1', dayOfJourney: 1 },
  { stationId: 'st_ald', station: stationById('st_ald')!, sequence: 2, distanceKm: 658, scheduledArrival: '03:55', scheduledDeparture: '04:00', haltMinutes: 5, dayOfJourney: 2 },
  { stationId: 'st_cnb', station: stationById('st_cnb')!, sequence: 3, distanceKm: 1011, scheduledArrival: '07:50', scheduledDeparture: '07:55', haltMinutes: 5, dayOfJourney: 2 },
  { stationId: 'st_ndls', station: stationById('st_ndls')!, sequence: 4, distanceKm: 1451, scheduledArrival: '13:55', scheduledDeparture: null, haltMinutes: 0, platform: 'PF4', dayOfJourney: 2 },
];

// 12952 New Delhi Rajdhani return — New Delhi → Mumbai Central
const ndlsMmcRoute: RouteStop[] = [...rajdhaniRoute].reverse().map((stop, idx, arr) => ({
  ...stop,
  sequence: idx + 1,
  distanceKm: arr[0].distanceKm - stop.distanceKm,
  scheduledArrival: idx === 0 ? null : stop.scheduledArrival,
  scheduledDeparture: idx === arr.length - 1 ? null : stop.scheduledDeparture,
}));

// 12626 Kerala Express — New Delhi → Trivandrum (long route, abbreviated)
const keralaRoute: RouteStop[] = [
  { stationId: 'st_ndls', station: stationById('st_ndls')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '11:25', haltMinutes: 0, dayOfJourney: 1 },
  { stationId: 'st_math', station: stationById('st_math')!, sequence: 2, distanceKm: 141, scheduledArrival: '13:28', scheduledDeparture: '13:30', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_agc', station: stationById('st_agc')!, sequence: 3, distanceKm: 200, scheduledArrival: '14:30', scheduledDeparture: '14:32', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_gwl', station: stationById('st_gwl')!, sequence: 4, distanceKm: 312, scheduledArrival: '16:10', scheduledDeparture: '16:12', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_jhs', station: stationById('st_jhs')!, sequence: 5, distanceKm: 403, scheduledArrival: '17:25', scheduledDeparture: '17:30', haltMinutes: 5, dayOfJourney: 1 },
  { stationId: 'st_bpl', station: stationById('st_bpl')!, sequence: 6, distanceKm: 705, scheduledArrival: '21:25', scheduledDeparture: '21:30', haltMinutes: 5, dayOfJourney: 1 },
  { stationId: 'st_et', station: stationById('st_et')!, sequence: 7, distanceKm: 815, scheduledArrival: '22:50', scheduledDeparture: '22:55', haltMinutes: 5, dayOfJourney: 1 },
  { stationId: 'st_ngp', station: stationById('st_ngp')!, sequence: 8, distanceKm: 1093, scheduledArrival: '02:25', scheduledDeparture: '02:30', haltMinutes: 5, dayOfJourney: 2 },
];

// 16526 Bangalore-Kacheguda Express — Bengaluru → Secunderabad
const bangaloreRoute: RouteStop[] = [
  { stationId: 'st_sbc', station: stationById('st_sbc')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '18:50', haltMinutes: 0, dayOfJourney: 1 },
  { stationId: 'st_pune', station: stationById('st_pune')!, sequence: 2, distanceKm: 836, scheduledArrival: '09:20', scheduledDeparture: '09:25', haltMinutes: 5, dayOfJourney: 2 },
  { stationId: 'st_sc', station: stationById('st_sc')!, sequence: 3, distanceKm: 790, scheduledArrival: '08:15', scheduledDeparture: null, haltMinutes: 0, dayOfJourney: 2 },
];

const vandeBharatRoute: RouteStop[] = [
  { stationId: 'st_mmc', station: stationById('st_mmc')!, sequence: 1, distanceKm: 0, scheduledArrival: null, scheduledDeparture: '05:25', haltMinutes: 0, dayOfJourney: 1 },
  { stationId: 'st_st', station: stationById('st_st')!, sequence: 2, distanceKm: 263, scheduledArrival: '08:10', scheduledDeparture: '08:12', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_brc', station: stationById('st_brc')!, sequence: 3, distanceKm: 392, scheduledArrival: '09:55', scheduledDeparture: '09:57', haltMinutes: 2, dayOfJourney: 1 },
  { stationId: 'st_adi', station: stationById('st_adi')!, sequence: 4, distanceKm: 491, scheduledArrival: '11:15', scheduledDeparture: null, haltMinutes: 0, dayOfJourney: 1 },
];

export const TRAINS: Train[] = [
  {
    trainNumber: '12951',
    name: 'Mumbai Rajdhani Express',
    operator: 'Western Railway',
    type: 'Rajdhani',
    originStation: stationById('st_mmc')!,
    destinationStation: stationById('st_ndls')!,
    classes: [
      classFactory('3A', 'AC 3 Tier', 2750, 42, 64),
      classFactory('2A', 'AC 2 Tier', 3965, 18, 46),
      classFactory('1A', 'AC First Class', 6725, 8, 24),
    ],
    route: rajdhaniRoute,
    runsOnDays: [1, 2, 3, 4, 5, 6, 0],
    durationMinutes: 16 * 60 + 40,
    distanceKm: 1384,
    departureTime: '16:35',
    arrivalTime: '10:15',
  },
  {
    trainNumber: '12952',
    name: 'New Delhi Rajdhani Express',
    operator: 'Western Railway',
    type: 'Rajdhani',
    originStation: stationById('st_ndls')!,
    destinationStation: stationById('st_mmc')!,
    classes: [
      classFactory('3A', 'AC 3 Tier', 2750, 56, 64),
      classFactory('2A', 'AC 2 Tier', 3965, 22, 46),
      classFactory('1A', 'AC First Class', 6725, 12, 24),
    ],
    route: ndlsMmcRoute,
    runsOnDays: [1, 2, 3, 4, 5, 6, 0],
    durationMinutes: 15 * 60 + 35,
    distanceKm: 1384,
    departureTime: '16:25',
    arrivalTime: '08:00',
  },
  {
    trainNumber: '12009',
    name: 'Shatabdi Express',
    operator: 'Western Railway',
    type: 'Shatabdi',
    originStation: stationById('st_mmc')!,
    destinationStation: stationById('st_adi')!,
    classes: [
      classFactory('CC', 'AC Chair Car', 1085, 120, 320),
      classFactory('EC', 'Exec Chair Car', 2150, 16, 56),
    ],
    route: shatabdiRoute,
    runsOnDays: [1, 2, 3, 4, 5, 6],
    durationMinutes: 6 * 60 + 40,
    distanceKm: 491,
    departureTime: '06:25',
    arrivalTime: '13:05',
  },
  {
    trainNumber: '12259',
    name: 'Sealdah Duronto Express',
    operator: 'Eastern Railway',
    type: 'Duronto',
    originStation: stationById('st_hwh')!,
    destinationStation: stationById('st_ndls')!,
    classes: [
      classFactory('SL', 'Sleeper', 705, 0, 0, 'REGRET'),
      classFactory('3A', 'AC 3 Tier', 2360, 38, 72),
      classFactory('2A', 'AC 2 Tier', 3385, 14, 54),
      classFactory('1A', 'AC First Class', 5810, 6, 22),
    ],
    route: durontoRoute,
    runsOnDays: [1, 3, 5],
    durationMinutes: 17 * 60 + 50,
    distanceKm: 1451,
    departureTime: '20:05',
    arrivalTime: '13:55',
  },
  {
    trainNumber: '12626',
    name: 'Kerala Express',
    operator: 'Northern Railway',
    type: 'Superfast',
    originStation: stationById('st_ndls')!,
    destinationStation: stationById('st_ngp')!,
    classes: [
      classFactory('SL', 'Sleeper', 615, 88, 480),
      classFactory('3A', 'AC 3 Tier', 1620, 42, 144),
      classFactory('2A', 'AC 2 Tier', 2335, 18, 72),
    ],
    route: keralaRoute,
    runsOnDays: [1, 2, 3, 4, 5, 6, 0],
    durationMinutes: 14 * 60 + 5,
    distanceKm: 1093,
    departureTime: '11:25',
    arrivalTime: '02:30',
  },
  {
    trainNumber: '16526',
    name: 'Kacheguda Express',
    operator: 'South Western Railway',
    type: 'Express',
    originStation: stationById('st_sbc')!,
    destinationStation: stationById('st_sc')!,
    classes: [
      classFactory('SL', 'Sleeper', 545, 124, 480),
      classFactory('3A', 'AC 3 Tier', 1440, 58, 144),
      classFactory('2A', 'AC 2 Tier', 2095, 22, 72),
    ],
    route: bangaloreRoute,
    runsOnDays: [2, 4, 6],
    durationMinutes: 13 * 60 + 25,
    distanceKm: 790,
    departureTime: '18:50',
    arrivalTime: '08:15',
  },
  {
    trainNumber: '20901',
    name: 'Vande Bharat Express',
    operator: 'Western Railway',
    type: 'Vande Bharat',
    originStation: stationById('st_mmc')!,
    destinationStation: stationById('st_adi')!,
    classes: [
      classFactory('CC', 'AC Chair Car', 1285, 156, 320),
      classFactory('EC', 'Exec Chair Car', 2480, 22, 56),
    ],
    route: vandeBharatRoute,
    runsOnDays: [1, 2, 3, 4, 5, 6],
    durationMinutes: 5 * 60 + 50,
    distanceKm: 491,
    departureTime: '05:25',
    arrivalTime: '11:15',
  },
];

export const trainByNumber = (number: string): Train | undefined =>
  TRAINS.find((t) => t.trainNumber === number);

export const findTrainsBetween = (fromId: string, toId: string): Train[] =>
  TRAINS.filter((t) => {
    const seq = t.route.map((r) => r.stationId);
    const fromIdx = seq.indexOf(fromId);
    const toIdx = seq.indexOf(toId);
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  });
