'use client';

import { useState, useEffect } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { GameStatus, type GameInstance, type PageResponse } from '@/types/game';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { getStatusDisplayName } from '@/utils/game-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
type SortOption = 'playTime' | 'lastPlayed';

export function GameLibrary() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('playTime');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['game-instances', { page, status: selectedStatus, sortBy }],
    queryFn: async () => {
      const response = await api.get<PageResponse<GameInstance>>('/game-instances', {
        params: {
          page: page - 1,
          size: PAGE_SIZE,
          status: selectedStatus || undefined,
          sort: sortBy
        }
      });
      return response.data;
    }
  });

  const filteredGames = response?.content || [];
  const totalPages = response?.totalPages || 1;

  const handleStatusChange = async (instanceId: number, newStatus: GameStatus) => {
    try {
      await api.patch(`/game-instances/${instanceId}/status`, null, {
        params: { status: newStatus }
      });
      queryClient.invalidateQueries({ queryKey: ['game-instances'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    } catch (error) {
      console.error('Failed to update game status:', error);
    }
  };

  const handleDelete = async (instanceId: number) => {
    try {
      await api.delete(`/game-instances/${instanceId}`);
      queryClient.invalidateQueries({ queryKey: ['game-instances'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    } catch (error) {
      console.error('Failed to delete game from library:', error);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, sortBy]);

  const generatePaginationRange = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }

    range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col items-center space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 text-center px-4">
          {user?.steamUser?.personaName || user?.username}&apos;s Library
        </h1>
        <div className="flex flex-col space-y-3 w-full max-w-4xl">
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              onClick={() => setSelectedStatus(null)}
              className="shrink-0 h-8 md:h-9 text-xs md:text-sm px-2.5 md:px-4"
            >
              All
            </Button>
            {Object.values(GameStatus).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className="shrink-0 h-8 md:h-9 text-xs md:text-sm px-2.5 md:px-4"
              >
                {getStatusDisplayName(status)}
              </Button>
            ))}
          </div>
          <div className="flex justify-end px-4 md:px-0">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-8 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playTime">Play Time</SelectItem>
                <SelectItem value="lastPlayed">Last Played</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!filteredGames.length ? (
        <div className="text-center py-8 md:py-12 px-4">
          <p className="text-sm md:text-base text-muted-foreground">
            {selectedStatus 
              ? `No games marked as ${getStatusDisplayName(selectedStatus).toLowerCase()}`
              : "Your library is empty. Add some games from the games page!"
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 px-2 md:px-0">
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
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 md:mt-6">
              <Pagination>
                <PaginationContent className="overflow-x-auto flex-nowrap">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={cn(
                        "h-8 md:h-10",
                        page <= 1 ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>

                  {generatePaginationRange(page, totalPages).map((pageNum, i) => (
                    <PaginationItem key={i}>
                      {pageNum === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(Number(pageNum));
                          }}
                          className="h-8 md:h-10"
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={cn(
                        "h-8 md:h-10",
                        page >= totalPages ? 'pointer-events-none opacity-50' : ''
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
} 