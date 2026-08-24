import { apiRequest } from './apiClient';
import {
  mockSimulationEvent,
  mockSimulationPause,
  mockSimulationReset,
  mockSimulationStart,
  mockSimulationStatus,
} from '@/data/mockApi';
import type { SimulationEventType, SimulationStatus } from '@/types';

export const simulationApi = {
  start: (trainInstanceId: string) =>
    apiRequest<SimulationStatus>(
      { method: 'POST', url: `/simulation/${trainInstanceId}/start` },
      () => mockSimulationStart(trainInstanceId)
    ),

  pause: (trainInstanceId: string) =>
    apiRequest<SimulationStatus>(
      { method: 'POST', url: `/simulation/${trainInstanceId}/pause` },
      () => mockSimulationPause(trainInstanceId)
    ),

  reset: (trainInstanceId: string) =>
    apiRequest<SimulationStatus>(
      { method: 'POST', url: `/simulation/${trainInstanceId}/reset` },
      () => mockSimulationReset(trainInstanceId)
    ),

  event: (trainInstanceId: string, event: SimulationEventType) =>
    apiRequest<SimulationStatus>(
      { method: 'POST', url: `/simulation/${trainInstanceId}/event`, data: { event } },
      () => mockSimulationEvent(trainInstanceId, event)
    ),

  status: (trainInstanceId: string) =>
    apiRequest<SimulationStatus>(
      { method: 'GET', url: `/simulation/${trainInstanceId}/status` },
      () => mockSimulationStatus(trainInstanceId)
    ),
};
