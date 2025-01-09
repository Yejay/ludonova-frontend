'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GameStatus } from '@/types/game';
import { getStatusColor, getStatusDisplayName } from '@/utils/game-status';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ClockIcon, 
  PlayIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  StackIcon
} from '@radix-ui/react-icons';

interface LibraryStatsResponse {
  totalGames: number;
  statusCounts: Partial<Record<GameStatus, number>>;
  totalPlayTime: number;
}

const statusIcons = {
  [GameStatus.PLAN_TO_PLAY]: ClockIcon,
  [GameStatus.PLAYING]: PlayIcon,
  [GameStatus.COMPLETED]: CheckCircledIcon,
  [GameStatus.DROPPED]: CrossCircledIcon,
};

export function LibraryStats() {
  const { data: stats } = useQuery({
    queryKey: ['library-stats'],
    queryFn: async () => {
      const response = await api.get<LibraryStatsResponse>('/game-instances/stats');
      return response.data;
    }
  });

  const counts = stats?.statusCounts || {};
  const total = stats?.totalGames || 0;

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Object.values(GameStatus).map((status) => {
        const Icon = statusIcons[status];
        return (
          <Card key={status}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{getStatusDisplayName(status)}</span>
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(status)}`}>
                {counts[status] || 0}
              </p>
            </CardContent>
          </Card>
        );
      })}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StackIcon className="h-4 w-4" />
            <span>Total Games</span>
          </div>
          <p className="text-2xl font-bold">{total}</p>
        </CardContent>
      </Card>
    </div>
  );
} 