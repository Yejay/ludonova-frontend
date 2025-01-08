'use client';

import { useState } from 'react';
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

const GAMES_KEY = 'games';
const GAME_INSTANCES_KEY = 'game-instances';
const LIBRARY_STATS_KEY = 'library-stats';

interface Game {
	id: number;
	title: string;
	backgroundImage: string;
	genres: string[];
}

export default function GamesPage() {
	const [search, setSearch] = useState('');
	const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
	const debouncedSearch = useDebounce(search, 300);
	const queryClient = useQueryClient();

	const { data: response, isLoading } = useQuery({
		queryKey: [GAMES_KEY, { search: debouncedSearch }],
		queryFn: async () => {
			const response = await api.get<PageResponse<Game>>('/games', {
				params: {
					search: debouncedSearch || undefined,
					page: 0,
					size: 12
				}
			});
			return response.data;
		}
	});

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
		<div className="container py-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Browse Games</h1>
				<div className="w-72">
					<Input
						placeholder="Search games..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<Skeleton key={i} className="aspect-[16/9]" />
					))}
				</div>
			) : !response?.content.length ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No games found</p>
				</div>
			) : (
				<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{response.content.map((game) => (
						<Dialog key={game.id} open={selectedGameId === game.id} onOpenChange={(open) => !open && setSelectedGameId(null)}>
							<DialogTrigger asChild>
								<div>
									<GameCard
										variant="browse"
										gameId={game.id}
										title={game.title}
										backgroundImage={game.backgroundImage}
										genres={game.genres}
										onAddToLibrary={() => setSelectedGameId(game.id)}
									/>
								</div>
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
											className="h-auto py-4 px-6"
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
			)}
		</div>
	);
}
