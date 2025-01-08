export enum GameStatus {
  PLAN_TO_PLAY = 'PLAN_TO_PLAY',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
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

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  steamId?: string;
  createdAt: string;
  updatedAt: string;
}
