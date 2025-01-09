// app/(protected)/dashboard/page.tsx
'use client';

import { Suspense } from 'react';
import { GameLibrary } from './components/GameLibrary';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
	return (
		<div className='space-y-8'>
			<Suspense
				fallback={
					<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className='aspect-[3/4]' />
						))}
					</div>
				}
			>
				<GameLibrary />
			</Suspense>
		</div>
	);
}
