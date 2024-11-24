'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GameCard } from '@/components/games/GameCard';
import { fetchGames } from '@/lib/api/games';
import { GameGridSkeleton } from '@/components/games/GameGridSkeleton';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import type { PageResponse } from '@/types/game';

function GameGrid() {
	const [page, setPage] = useState(1);

	const generatePagination = (
		currentPage: number,
		totalPages: number
	): (number | string)[] => {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		if (currentPage <= 3) {
			return [1, 2, 3, 4, 5, '...', totalPages];
		}

		if (currentPage >= totalPages - 2) {
			return [
				1,
				'...',
				totalPages - 4,
				totalPages - 3,
				totalPages - 2,
				totalPages - 1,
				totalPages,
			];
		}

		return [
			1,
			'...',
			currentPage - 1,
			currentPage,
			currentPage + 1,
			'...',
			totalPages,
		];
	};

	const { data, isError, error, isLoading } = useQuery<PageResponse, Error>({
		queryKey: ['games', page],
		queryFn: () => fetchGames({ page: page - 1, limit: 20 }),
		retry: 1,
		staleTime: 30000,
		refetchOnWindowFocus: false,
	});

	if (isLoading) {
		return <GameGridSkeleton />;
	}

	if (isError) {
		return (
			<div className='text-center text-red-500'>
				Error loading games: {error?.message || 'Unknown error'}
			</div>
		);
	}

	if (!data?.content || data.content.length === 0) {
		return <div className='text-center text-yellow-500'>No games found</div>;
	}

	return (
		<div className='space-y-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				{data.content.map((game) => (
					<GameCard key={game.id} game={game} />
				))}
			</div>

			{data.totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href='#'
								onClick={(e) => {
									e.preventDefault();
									if (page > 1) setPage(page - 1);
								}}
								className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>

						{generatePagination(page, data.totalPages).map((pageNumber, i) => (
							<PaginationItem key={i}>
								{pageNumber === '...' ? (
									<PaginationEllipsis />
								) : (
									<PaginationLink
										href='#'
										onClick={(e) => {
											e.preventDefault();
											setPage(pageNumber as number);
										}}
										isActive={page === pageNumber}
									>
										{pageNumber}
									</PaginationLink>
								)}
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								href='#'
								onClick={(e) => {
									e.preventDefault();
									if (page < data.totalPages) setPage(page + 1);
								}}
								className={
									page >= data.totalPages
										? 'pointer-events-none opacity-50'
										: ''
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}

export { GameGrid };
