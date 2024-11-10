import api from './client';
import type { LoginResponse, User } from './types';

export const auth = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },
  validate: async (): Promise<User> => {
    const response = await api.get<User>('/auth/validate');
    return response.data;
  },
};