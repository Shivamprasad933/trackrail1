import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_URL, DEMO_MODE } from '@/lib/env';
import type { ApiError } from '@/types';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('railflow:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message:
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        'Something went wrong',
      status: error.response?.status,
      code: error.code,
    };
    if (error.response?.status === 401) {
      localStorage.removeItem('railflow:token');
      localStorage.removeItem('railflow:user');
    }
    return Promise.reject(apiError);
  }
);

// A thin wrapper that lets the rest of the app call the same service API whether
// we are talking to a real backend or running in demo mode against mock data.
export async function apiRequest<T>(config: AxiosRequestConfig, mock: () => Promise<T>): Promise<T> {
  if (DEMO_MODE) return mock();
  const res = await apiClient.request<T>(config);
  return res.data;
}
