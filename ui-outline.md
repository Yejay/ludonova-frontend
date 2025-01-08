Ludonova Frontend Implementation Guide
Help me implement the frontend for a game library application that connects to a Spring Boot backend. The backend uses the following structure for game instances:
interface GameInstance {
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

enum GameStatus {
  PLAN_TO_PLAY = 'PLAN_TO_PLAY',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
}
mplementation Requirements
1. API Client Layer
Set up axios client with proper error handling and token management
Create endpoints for user management (/api/user/*)
Create endpoints for game library management (/api/game-instances/*)
Create endpoints for game browsing (/api/games/*)
2. Dashboard Page
User profile section with Steam connection status
Statistics overview showing game counts by status
Game library grid with filtering by status
Game card features:
Game image
Title
Current status with ability to change
Link to game details
3. Games Browsing Page
Grid of available games
Add to library functionality
Pagination support
Search functionality
4. Error Handling & Loading States
Proper error handling throughout
Loading states for async operations
Type safety across all components
Backend Endpoints
// User Endpoints
GET /api/user/current         // Get current user

// Games Endpoints
GET /api/games               // List games (paginated)

// Game Library Endpoints
GET /api/game-instances      // Get user's game library
POST /api/game-instances     // Add game to library
PATCH /api/game-instances/{id}/status  // Update game status

Please help me implement this step by step, ensuring type safety and proper error handling throughout.

Backend Data Structures
interface GameInstance {
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

enum GameStatus {
  PLAN_TO_PLAY = 'PLAN_TO_PLAY',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
}

interface PageResponse<T> {
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

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  steamId?: string;
  createdAt: string;
  updatedAt: string;
}
API Implementation
API Client Setup
// lib/api/client.ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add interceptors for:
// 1. Token management
// 2. Error handling
// 3. Request logging in development
Expected Response Formats
// Game Instances Response
GET /api/game-instances
{
  "content": [
    {
      "id": 1,
      "gameId": 119,
      "gameTitle": "Game Title",
      "backgroundImage": "https://example.com/image.jpg",
      "status": "PLAN_TO_PLAY",
      "progressPercentage": 0,
      "playTime": 0,
      "notes": null,
      "lastPlayed": null,
      "addedAt": "2025-01-07T19:52:45.424776",
      "genres": ["RPG"]
    }
  ],
  // ... pagination info
}

// Add to Library Request
POST /api/game-instances
{
  "gameId": number,
  "status": GameStatus
}

Component Structure
Dashboard Layout
// app/(protected)/dashboard/page.tsx structure:
- UserProfile component (top)
- Statistics overview (middle)
- Game library grid (bottom)
  - Filtering controls
  - GameCard components
  GameCard Component Features
  interface GameCardProps {
  game: {
    id: number;
    title: string;
    backgroundImage?: string;
    genres: string[];
  };
  status?: GameStatus;
  instanceId?: number;
}

Important Implementation Details
Status Display Names
const getStatusDisplayName = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.PLAYING: return 'Playing';
    case GameStatus.COMPLETED: return 'Completed';
    case GameStatus.DROPPED: return 'Dropped';
    case GameStatus.PLAN_TO_PLAY: return 'Plan to Play';
    default: return status;
  }
};

Status Colors
const getStatusColor = (status: GameStatus) => {
  switch (status) {
    case GameStatus.PLAYING:
      return 'bg-green-500/10 text-green-500';
    case GameStatus.COMPLETED:
      return 'bg-blue-500/10 text-blue-500';
    case GameStatus.DROPPED:
      return 'bg-red-500/10 text-red-500';
    case GameStatus.PLAN_TO_PLAY:
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-muted';
  }
};
Auto-refresh Mechanism
// Dashboard refresh on window focus
useEffect(() => {
  const handleFocus = () => {
    setRefreshKey(prev => prev + 1);
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);

Error Handling
Common Error Scenarios
Game already in library
Invalid game ID
Authentication failures
Network errors
Loading States
Skeleton loaders for game grid
Disabled states during operations
Loading indicators for status changes

Please help me implement this step by step, ensuring:
Type safety throughout
Proper error handling
Loading states for all async operations
Consistent status management
Proper data refresh on state changes