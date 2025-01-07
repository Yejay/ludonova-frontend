import { api } from './client';
import type { Game, GameInstance, PageResponse } from '@/types/game';
import { GameStatus } from '@/types/game';

interface FetchGamesParams {
	page?: number;
	size?: number;
	search?: string;
}

interface GameInstanceCreateDTO {
	gameId: number;
	status: GameStatus;
	notes?: string;
}

interface GameInstanceUpdateDTO {
	status?: GameStatus;
	notes?: string;
}

// Game endpoints
export async function fetchGames(params: FetchGamesParams = {}): Promise<PageResponse<Game>> {
	const { data } = await api.get<PageResponse<Game>>('/games', { params });
	return data;
}

export async function fetchGameById(id: number): Promise<Game> {
	const { data } = await api.get<Game>(`/games/${id}`);
	return data;
}

// Game Instance (Library) endpoints
export async function fetchUserGameInstances(params: FetchGamesParams = {}): Promise<PageResponse<GameInstance>> {
	const { data } = await api.get<PageResponse<GameInstance>>('/game-instances', { params });
	return data;
}

export async function fetchUserGameInstancesByStatus(status: GameStatus): Promise<GameInstance[]> {
	const { data } = await api.get<GameInstance[]>(`/game-instances/status/${status}`);
	return data;
}

export async function addGameToLibrary(createDTO: GameInstanceCreateDTO): Promise<GameInstance> {
	const { data } = await api.post<GameInstance>('/game-instances', createDTO);
	return data;
}

export async function updateGameInstance(id: number, updateDTO: GameInstanceUpdateDTO): Promise<GameInstance> {
	const { data } = await api.put<GameInstance>(`/game-instances/${id}`, updateDTO);
	return data;
}

export async function updateGameStatus(id: number, status: GameStatus): Promise<GameInstance> {
	const { data } = await api.patch<GameInstance>(`/game-instances/${id}/status`, null, {
		params: { status }
	});
	return data;
}

export async function removeGameFromLibrary(id: number): Promise<void> {
	await api.delete(`/game-instances/${id}`);
}
