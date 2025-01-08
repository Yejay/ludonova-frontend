'use client';

import { useState } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { GameStatus, type GameInstance, type PageResponse } from '@/types/game';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { getStatusDisplayName } from '@/utils/game-status';
import { Skeleton } from '@/components/ui/skeleton';

const GAME_INSTANCES_KEY = 'game-instances';
const LIBRARY_STATS_KEY = 'library-stats';

export function GameLibrary() {
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: [GAME_INSTANCES_KEY],
    queryFn: async () => {
      const response = await api.get<PageResponse<GameInstance>>('/game-instances', {
        params: {
          page: 0,
          size: 100, // Get more games since we're filtering client-side
          sort: 'lastPlayed,desc'
        }
      });
      return response.data;
    },
    staleTime: 1000 * 60 // Cache for 1 minute
  });

  const handleStatusChange = async (gameId: number, newStatus: GameStatus) => {
    try {
      await api.patch(`/game-instances/${gameId}/status`, {
        status: newStatus
      });
      // Invalidate both queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: [GAME_INSTANCES_KEY] });
      await queryClient.invalidateQueries({ queryKey: [LIBRARY_STATS_KEY] });
    } catch (error) {
      console.error('Failed to update game status:', error);
    }
  };

  // Filter games based on selected status
  const filteredGames = response?.content.filter(game => 
    selectedStatus ? game.status === selectedStatus : true
  ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[16/9]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Your Library</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedStatus === null ? "default" : "outline"}
            onClick={() => setSelectedStatus(null)}
          >
            All
          </Button>
          {Object.values(GameStatus).map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
            >
              {getStatusDisplayName(status)}
            </Button>
          ))}
        </div>
      </div>

      {!filteredGames.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedStatus 
              ? `No games marked as ${getStatusDisplayName(selectedStatus).toLowerCase()}`
              : "Your library is empty. Add some games from the games page!"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              variant="library"
              gameId={game.gameId}
              title={game.gameTitle}
              backgroundImage={game.backgroundImage}
              genres={game.genres}
              instance={{
                id: game.id,
                status: game.status,
                lastPlayed: game.lastPlayed,
                playTime: game.playTime,
                progressPercentage: game.progressPercentage
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
} 