import { api } from './client';
import type { Game, PageResponse } from '@/types/game';

interface FetchGamesParams {
	page?: number;
	limit?: number;
	search?: string;
}

export async function fetchGames({ page = 0, limit = 20, search = '' }: FetchGamesParams = {}): Promise<PageResponse> {
	try {
		const { data } = await api.get<PageResponse>('/games', {
			params: {
				page,
				size: limit,
				...(search ? { search: search.trim() } : {})
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
