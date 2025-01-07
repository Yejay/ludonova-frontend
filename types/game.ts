export interface Game {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  genres: string[];
  platforms: string[];
  backgroundImage?: string;
  steamAppId?: number;
}

export interface GameInstance {
  id: number;
  gameId: number;
  gameTitle: string;
  backgroundImage: string;
  status: GameStatus;
  progressPercentage: number;
  playTime: number;
  notes: string | null;
  lastPlayed: string | null;
  addedAt: string;
  genres: string[];
}

export enum GameStatus {
  PLAN_TO_PLAY = 'PLAN_TO_PLAY',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface GetGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
}
