'use client';

import { Suspense } from 'react';

import { GameGrid } from '@/components/games/game-grid';
import { GameGridSkeleton } from '@/components/games/GameGridSkeleton';

export default function GamesPage() {
	return (
		<main className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Games</h1>
			<Suspense fallback={<GameGridSkeleton />}>
				<GameGrid />
			</Suspense>
		</main>
	);
}
