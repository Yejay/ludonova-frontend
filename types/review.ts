import type { User } from './user';
import type { Game } from './game';

export interface Review {
	id: number;
	rating: number;
	content: string;
	user: User;
	game: Game;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewCreateDTO {
	gameId: number;
	rating: number;
	content: string;
}

export interface ReviewUpdateDTO extends ReviewCreateDTO {
	id: number;
} 