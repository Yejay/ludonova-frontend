export interface LoginResponse {
    token: string;
    message?: string;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface Game {
    id: number;
    title: string;
    platform: string;
    status: 'not-started' | 'in-progress' | 'completed';
    rating?: number;
    notes?: string;
    lastPlayed?: string;
    playTime?: number;
  }
  
  export interface GameCreateInput {
    title: string;
    platform: string;
    status: 'not-started' | 'in-progress' | 'completed';
    notes?: string;
  }
  
  export interface GameUpdateInput extends Partial<GameCreateInput> {
    rating?: number;
    lastPlayed?: string;
    playTime?: number;
  }