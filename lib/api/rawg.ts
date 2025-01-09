const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// RAWG Game IDs
export const FEATURED_GAME_IDS = {
  ELDEN_RING: 326243,    // Elden Ring
  CYBERPUNK: 41494,      // Cyberpunk 2077
  HADES: 274755,         // Hades
  STARDEW_VALLEY: 654,   // Stardew Valley
  LAST_OF_US: 3636,      // The Last of Us
  SPIDERMAN: 58134,      // Marvel's Spider-Man
  DARK_SOULS: 2551,      // Dark Souls III
  GOD_OF_WAR: 58550,     // God of War (2018)
};

// Hero section games
export const HERO_GAME_IDS = [
  FEATURED_GAME_IDS.ELDEN_RING,
  FEATURED_GAME_IDS.CYBERPUNK,
  FEATURED_GAME_IDS.LAST_OF_US,
  FEATURED_GAME_IDS.SPIDERMAN,
];

export interface Game {
  id: number;
  name: string;
  background_image: string;
  genres: { id: number; name: string; }[];
  rating: number;
  released: string;
  description_raw?: string;
  metacritic?: number;
  platforms?: { platform: { id: number; name: string; }; }[];
}

export interface GamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}

export const rawgApi = {
  getGame: async (id: number): Promise<Game> => {
    const response = await fetch(
      `${RAWG_BASE_URL}/games/${id}?key=${RAWG_API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch game');
    return response.json();
  },

  getMultipleGames: async (ids: number[]): Promise<Game[]> => {
    // Fetch all games in a single request using the ids parameter
    const idsString = ids.join(',');
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ids=${idsString}`
    );
    if (!response.ok) throw new Error('Failed to fetch games');
    const data = await response.json();
    return data.results;
  },

  getPopularGames: async (pageSize: number = 8): Promise<GamesResponse> => {
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-rating&page_size=${pageSize}`
    );
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  },

  searchGames: async (query: string, pageSize: number = 20): Promise<GamesResponse> => {
    const response = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${query}&page_size=${pageSize}`
    );
    if (!response.ok) throw new Error('Failed to search games');
    return response.json();
  }
}; 