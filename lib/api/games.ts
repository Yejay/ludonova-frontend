import api from './client';
import type { Game, GameCreateInput, GameUpdateInput } from './types';

export const games = {
  list: async (): Promise<Game[]> => {
    const response = await api.get<Game[]>('/games');
    return response.data;
  },
  get: async (id: string): Promise<Game> => {
    const response = await api.get<Game>(`/games/${id}`);
    return response.data;
  },
  create: async (data: GameCreateInput): Promise<Game> => {
    const response = await api.post<Game>('/games', data);
    return response.data;
  },
  update: async (id: string, data: GameUpdateInput): Promise<Game> => {
    const response = await api.put<Game>(`/games/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/games/${id}`);
  },
};