import type { AuthResponse, User } from '../types';
import { api } from './client';

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> =>
  (await api.post<AuthResponse>('/auth/login', { email, password })).data;

export const registerRequest = async (name: string, email: string, password: string): Promise<AuthResponse> =>
  (await api.post<AuthResponse>('/auth/register', { name, email, password })).data;

export const meRequest = async (): Promise<User> => (await api.get<{ user: User }>('/auth/me')).data.user;
