import { apiRequest } from './apiClient';
import {
  mockCancelBooking,
  mockCreateBooking,
  mockFareQuote,
  mockGetBooking,
  mockGetMyBookings,
} from '@/data/mockApi';
import type { Booking, FareBreakdown } from '@/types';

export interface CreateBookingInput {
  trainInstanceId: string;
  trainNumber: string;
  classCode: string;
  journeyDate: string;
  fromStationId: string;
  toStationId: string;
  passengers: { name: string; age: number; gender: 'M' | 'F' | 'O'; berthPreference: string }[];
}

export const bookingApi = {
  fareQuote: (trainInstanceId: string, classCode: string, passengerCount: number) =>
    apiRequest<{ fare: FareBreakdown; classCode: string; className: string }>(
      { method: 'POST', url: '/bookings/fare-quote', data: { trainInstanceId, classCode, passengerCount } },
      () => mockFareQuote(trainInstanceId, classCode, passengerCount)
    ),

  create: (input: CreateBookingInput) =>
    apiRequest<Booking>(
      { method: 'POST', url: '/bookings', data: input },
      () => mockCreateBooking(input)
    ),

  get: (id: string) =>
    apiRequest<Booking>(
      { method: 'GET', url: `/bookings/${id}` },
      () => mockGetBooking(id)
    ),

  mine: (userId: string) =>
    apiRequest<Booking[]>(
      { method: 'GET', url: '/bookings' },
      () => mockGetMyBookings(userId)
    ),

  cancel: (id: string) =>
    apiRequest<Booking>(
      { method: 'POST', url: `/bookings/${id}/cancel` },
      () => mockCancelBooking(id)
    ),
};
