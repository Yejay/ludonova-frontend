// app/(protected)/dashboard/page.tsx
'use client';

import { GamesList } from '@/components/dashboard/games-list';
import { DashboardStats } from '@/components/dashboard/stats';

export default function DashboardPage() {
	return (
		<div className='min-h-screen bg-background'>
			{/* <DashboardHeader /> */}

			<div className='flex'>
				{/* Main Content */}
				<main className='flex-1 p-8'>
					<div className='max-w-7xl mx-auto space-y-6'>
						{/* Stats Section */}
						<section className='grid gap-4'>
							<h2 className='text-xl font-semibold'>Overview</h2>
							<DashboardStats />
						</section>

						{/* Games List Section */}
						<section className='grid gap-4'>
							<h2 className='text-xl font-semibold'>Your Games</h2>
							<GamesList />
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}
