// Centralised access to Vite env vars with safe fallbacks.
const env = import.meta.env;

export const API_URL = (env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api';
export const SOCKET_URL = (env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:4000';
export const MAP_API_KEY = (env.VITE_MAP_API_KEY as string | undefined) ?? '';
export const MAP_PROVIDER = ((env.VITE_MAP_PROVIDER as string | undefined) ?? 'google') as 'google' | 'mapbox';

// When no backend is configured, the app runs in demo mode against the bundled mock API.
export const DEMO_MODE = !env.VITE_API_URL || env.VITE_API_URL === 'http://localhost:4000/api';
