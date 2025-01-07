export interface User {
	id: number;
	username: string;
	email: string;
	role: Role;
	steamId?: string;
	createdAt: string;
	updatedAt: string;
}

export enum Role {
	USER = 'ROLE_USER',
	ADMIN = 'ROLE_ADMIN'
}

export interface CreateUserData {
	username: string;
	email: string;
	password: string;
}

export interface UpdateUserData {
	email?: string;
	password?: string;
}
