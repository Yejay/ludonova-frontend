import { api } from './client';
import type { Game } from '@/types/game';

export async function syncSteamLibrary(): Promise<Game[]> {
	try {
		const { data } = await api.post<Game[]>('/steam/sync-library');
		return data;
	} catch (error) {
		throw error;
	}
}

export async function getSteamAuthUrl(): Promise<{ url: string }> {
	try {
		const { data } = await api.get<{ url: string }>('/auth/steam/url');
		return data;
	} catch (error) {
		throw error;
	}
}

export async function handleSteamCallback(params: URLSearchParams): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
	try {
		const { data } = await api.post('/auth/steam/callback', {
			openIdParams: Object.fromEntries(params.entries()),
		});
		return data;
	} catch (error) {
		throw error;
	}
} 