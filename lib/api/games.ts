import { api } from './client';
import type { Game, PageResponse } from '@/types/game';

export async function fetchGames({
	page = 1,
	limit = 20,
} = {}): Promise<PageResponse> {
	try {
		const { data } = await api.get<PageResponse>('/games', {
			params: {
				page: page,
				size: limit,
			},
		});
		return data;
	} catch (error) {
		throw error;
	}
}

export async function fetchGameById(id: number): Promise<Game> {
	try {
		const { data } = await api.get<Game>(`/games/${id}`);
		return data;
	} catch (error) {
		throw error;
	}
}
