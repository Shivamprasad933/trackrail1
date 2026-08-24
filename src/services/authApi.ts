import { apiRequest } from './apiClient';
import { mockLogin, mockRegister } from '@/data/mockApi';
import type { User } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>(
      { method: 'POST', url: '/auth/login', data: { email, password } },
      () => mockLogin(email, password)
    ),

  register: (name: string, email: string, password: string) =>
    apiRequest<AuthResponse>(
      { method: 'POST', url: '/auth/register', data: { name, email, password } },
      () => mockRegister(name, email, password)
    ),

  me: () =>
    apiRequest<User>(
      { method: 'GET', url: '/auth/me' },
      async () => {
        const raw = localStorage.getItem('railflow:user');
        if (!raw) throw Object.assign(new Error('Not authenticated'), { status: 401 });
        return JSON.parse(raw) as User;
      }
    ),
};
