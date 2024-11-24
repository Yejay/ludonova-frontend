export interface SteamUser {
	steamId: string;
	personaName: string;
	profileUrl: string;
	avatarUrl: string;
}

export interface User {
	id: number;
	username: string;
	email: string;
	role: 'USER' | 'ADMIN';
	steamUser: null | SteamUser;
	password: null;
	// content: [];
}

// If your API returns paginated data
export interface UserResponse {
	content: User[];
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
}
