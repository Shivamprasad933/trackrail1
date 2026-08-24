import { apiRequest } from './apiClient';
import {
  mockAdminBookings,
  mockAdminLiveInstances,
  mockAdminStations,
  mockAdminTrains,
  mockMLMetrics,
  mockPredictions,
} from '@/data/mockApi';
import type {
  AdminBooking,
  MLMetrics,
  PredictionRecord,
  Station,
  Train,
  TrainInstance,
} from '@/types';

export const adminApi = {
  trains: () =>
    apiRequest<Train[]>({ method: 'GET', url: '/admin/trains' }, () => mockAdminTrains()),

  stations: () =>
    apiRequest<Station[]>({ method: 'GET', url: '/admin/stations' }, () => mockAdminStations()),

  liveInstances: () =>
    apiRequest<TrainInstance[]>(
      { method: 'GET', url: '/admin/instances/live' },
      () => mockAdminLiveInstances()
    ),

  bookings: () =>
    apiRequest<AdminBooking[]>({ method: 'GET', url: '/admin/bookings' }, () => mockAdminBookings()),

  mlMetrics: () =>
    apiRequest<MLMetrics>({ method: 'GET', url: '/admin/ml/metrics' }, () => mockMLMetrics()),

  predictions: (limit = 20) =>
    apiRequest<PredictionRecord[]>(
      { method: 'GET', url: '/admin/ml/predictions', params: { limit } },
      () => mockPredictions(limit)
    ),
};
