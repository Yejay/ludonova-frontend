export interface Game {
  id: number;
  title: string;
  backgroundImage: string;
  rating: number;
  genres: string[];
  releaseDate: string;
  slug: string;
  apiId: string;
  source: string;
  rawgLastUpdated: string;
}

export interface PageResponse {
    content: Game[];
    totalPages: number;
    number: number;  // current page (0-based)
    totalElements: number;
  }

export interface GetGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
}
