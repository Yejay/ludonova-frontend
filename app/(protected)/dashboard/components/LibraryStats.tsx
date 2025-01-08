'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GameStatus } from '@/types/game';
import { getStatusColor, getStatusDisplayName } from '@/utils/game-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LIBRARY_STATS_KEY = 'library-stats';

interface LibraryStatsResponse {
  totalGames: number;
  statusCounts: Partial<Record<GameStatus, number>>;
  totalPlayTime: number;
}

export function LibraryStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [LIBRARY_STATS_KEY],
    queryFn: async () => {
      const response = await api.get<LibraryStatsResponse>('/game-instances/stats');
      return response.data;
    }
  });

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="py-4">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Total Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalGames}</div>
        </CardContent>
      </Card>

      {Object.values(GameStatus).map((status) => (
        <Card key={status}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              {getStatusDisplayName(status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
              {stats.statusCounts[status] || 0}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Total Play Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPlayTime(stats.totalPlayTime)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 