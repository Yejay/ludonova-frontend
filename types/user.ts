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
	// content: User[];
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
}

// Interface for creating a new user
export interface CreateUserData {
	username: string;
	email: string;
	password: string;
	role?: 'USER' | 'ADMIN';
	steamUser?: SteamUser;
	emailVerified?: boolean;
}

// Interface for updating an existing user
export interface UpdateUserData {
	username?: string;
	email?: string;
	role?: 'USER' | 'ADMIN';
	steamUser?: SteamUser | null;
	password?: string | null;
}
