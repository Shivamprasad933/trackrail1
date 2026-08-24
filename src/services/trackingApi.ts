import { apiRequest } from './apiClient';
import { mockGetTrackingSnapshot } from '@/data/mockApi';
import type { TrackingSnapshot } from '@/types';

export const trackingApi = {
  getSnapshot: (trainInstanceId: string) =>
    apiRequest<TrackingSnapshot>(
      { method: 'GET', url: `/tracking/${trainInstanceId}` },
      async () => {
        const { trainInstance, train, eta } = await mockGetTrackingSnapshot(trainInstanceId);
        return {
          trainInstance,
          train,
          location: null,
          state: null,
          eta,
        };
      }
    ),
};
