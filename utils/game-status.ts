import { GameStatus } from '@/types/game';

export const getStatusDisplayName = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.PLAYING:
      return 'Playing';
    case GameStatus.COMPLETED:
      return 'Completed';
    case GameStatus.DROPPED:
      return 'Dropped';
    case GameStatus.PLAN_TO_PLAY:
      return 'Plan to Play';
    default:
      return status;
  }
};

export const getStatusColor = (status: GameStatus): string => {
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