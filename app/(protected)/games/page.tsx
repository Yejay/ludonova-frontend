'use client';

import { useState, useEffect } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GameStatus, type PageResponse } from '@/types/game';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { getStatusDisplayName } from '@/utils/game-status';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

const GAMES_KEY = 'games';
const GAME_INSTANCES_KEY = 'game-instances';
const LIBRARY_STATS_KEY = 'library-stats';
const PAGE_SIZE = 15;

interface Game {
	id: number;
	title: string;
	backgroundImage: string;
	genres: string[];
}

function generatePaginationRange(currentPage: number, totalPages: number) {
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
}

export default function GamesPage() {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
	const debouncedSearch = useDebounce(search, 300);
	const queryClient = useQueryClient();

	const { data: response, isLoading } = useQuery({
		queryKey: [GAMES_KEY, { search: debouncedSearch, page }],
		queryFn: async () => {
			const response = await api.get<PageResponse<Game>>('/games', {
				params: {
					query: debouncedSearch || undefined,
					page: page - 1,
					size: PAGE_SIZE
				}
			});
			return response.data;
		},
		staleTime: 0,
	});

	// Reset page when search changes
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch]);

	// Prefetch next page
	useEffect(() => {
		if (response?.totalPages && page < response.totalPages) {
			queryClient.prefetchQuery({
				queryKey: [GAMES_KEY, { search: debouncedSearch, page: page + 1 }],
				queryFn: async () => {
					const response = await api.get<PageResponse<Game>>('/games', {
						params: {
							query: debouncedSearch || undefined,
							page: page,
							size: PAGE_SIZE
						}
					});
					return response.data;
				},
			});
		}
	}, [page, debouncedSearch, response?.totalPages, queryClient]);

	const handleSearch = (value: string) => {
		setSearch(value);
		// Invalidate current query to force a refresh
		queryClient.invalidateQueries({ queryKey: [GAMES_KEY] });
	};

	const handleAddToLibrary = async (gameId: number, status: GameStatus) => {
		try {
			await api.post('/game-instances', {
				gameId,
				status
			});
			await queryClient.invalidateQueries({ queryKey: [GAME_INSTANCES_KEY] });
			await queryClient.invalidateQueries({ queryKey: [LIBRARY_STATS_KEY] });
			setSelectedGameId(null);
		} catch (error) {
			console.error('Failed to add game to library:', error);
		}
	};

	return (
		<div className="flex-1 flex flex-col items-center py-8 space-y-8">
			{/* Search Section */}
			<div className="flex flex-col items-center space-y-4 w-full px-4">
				<h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
					Browse Games
				</h1>
				<div className="w-full max-w-lg">
					<Input
						type="search"
						placeholder="Search games..."
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						className="w-full"
					/>
				</div>
			</div>

			{/* Games Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full px-4">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<Skeleton key={i} className="aspect-[3/4] rounded-lg" />
					))}
				</div>
			) : !response?.content.length ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No games found</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full px-4">
						{response.content.map((game) => (
							<Dialog key={game.id} open={selectedGameId === game.id} onOpenChange={(open) => !open && setSelectedGameId(null)}>
								<DialogTrigger asChild>
									<GameCard
										variant="browse"
										gameId={game.id}
										title={game.title}
										backgroundImage={game.backgroundImage}
										genres={game.genres}
										onAddToLibrary={() => setSelectedGameId(game.id)}
									/>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Add {game.title} to Library</DialogTitle>
									</DialogHeader>
									<div className="grid grid-cols-2 gap-4 py-4">
										{Object.values(GameStatus).map((status) => (
											<Button
												key={status}
												variant="outline"
												className={cn(
													"h-auto py-4 px-6 hover:bg-primary/10",
													status === GameStatus.PLAYING && "border-primary/50",
													status === GameStatus.COMPLETED && "border-green-500/50",
													status === GameStatus.PLAN_TO_PLAY && "border-blue-500/50",
													status === GameStatus.DROPPED && "border-red-500/50"
												)}
												onClick={() => handleAddToLibrary(game.id, status)}
											>
												{getStatusDisplayName(status)}
											</Button>
										))}
									</div>
								</DialogContent>
							</Dialog>
						))}
					</div>

					{/* Pagination */}
					{response.totalPages > 1 && (
						<div className="flex justify-center mt-8">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (page > 1) setPage(page - 1);
											}}
											className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>

									{generatePaginationRange(page, response.totalPages).map((pageNum, i) => (
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
												if (page < response.totalPages) setPage(page + 1);
											}}
											className={page >= response.totalPages ? 'pointer-events-none opacity-50' : ''}
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
