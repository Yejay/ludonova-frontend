// app/(protected)/dashboard/page.tsx
'use client';

import { Suspense } from 'react';
import { GameLibrary } from './components/GameLibrary';
import { UserProfile } from './components/UserProfile';
import { LibraryStats } from './components/LibraryStats';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
	return (
		<div className='container py-6 space-y-8'>
			<Suspense fallback={<Skeleton className='h-32 w-full' />}>
				<UserProfile />
			</Suspense>
			
			<Suspense fallback={<Skeleton className='h-24 w-full' />}>
				<LibraryStats />
			</Suspense>
			
			<Suspense fallback={<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className='aspect-[16/9]' />
				))}
			</div>}>
				<GameLibrary />
			</Suspense>
		</div>
	);
}
