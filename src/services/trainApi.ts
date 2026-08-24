import { apiRequest } from './apiClient';
import {
  mockGetTrain,
  mockGetTrainInstance,
  mockSearchTrains,
} from '@/data/mockApi';
import type { Train, TrainInstance, TrainSearchResult } from '@/types';

export const trainApi = {
  search: (params: { fromId: string; toId: string; date: string; classCode?: string }) =>
    apiRequest<TrainSearchResult[]>(
      { method: 'GET', url: '/trains/search', params },
      () => mockSearchTrains(params.fromId, params.toId, params.date, params.classCode)
    ),

  getTrain: (trainNumber: string) =>
    apiRequest<Train>(
      { method: 'GET', url: `/trains/${trainNumber}` },
      () => mockGetTrain(trainNumber)
    ),

  getTrainInstance: (trainNumber: string, date: string) =>
    apiRequest<TrainInstance>(
      { method: 'GET', url: `/trains/${trainNumber}/instance`, params: { date } },
      () => mockGetTrainInstance(trainNumber, date)
    ),
};
