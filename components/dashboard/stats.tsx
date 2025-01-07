// components/dashboard/stats.tsx
'use client'

import { Gamepad, Trophy, Clock, X, BookmarkIcon } from 'lucide-react';

interface Stats {
	totalGames: number;
	playing: number;
	completed: number;
	plan_to_play: number;
	dropped: number;
}

interface DashboardStatsProps {
	stats: Stats | null;
	isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
	if (isLoading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='bg-card p-6 rounded-lg shadow-sm animate-pulse'>
						<div className='h-8 w-8 rounded-full bg-muted mb-4' />
						<div className='h-6 w-24 bg-muted rounded mb-2' />
						<div className='h-4 w-16 bg-muted rounded' />
					</div>
				))}
			</div>
		);
	}

	if (!stats) return null;

	const statCards = [
		{
			label: 'Total Games',
			value: stats.totalGames,
			icon: Gamepad,
			color: 'text-blue-500',
		},
		{
			label: 'Playing',
			value: stats.playing,
			icon: Clock,
			color: 'text-green-500',
		},
		{
			label: 'Completed',
			value: stats.completed,
			icon: Trophy,
			color: 'text-yellow-500',
		},
		{
			label: 'Plan to Play',
			value: stats.plan_to_play,
			icon: BookmarkIcon,
			color: 'text-orange-500',
		},
		{
			label: 'Dropped',
			value: stats.dropped,
			icon: X,
			color: 'text-red-500',
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{statCards.map((stat) => (
				<div key={stat.label} className='bg-card p-6 rounded-lg shadow-sm'>
					<div className={`${stat.color} mb-4`}>
						<stat.icon className='w-8 h-8' />
					</div>
					<h3 className='text-lg font-semibold'>{stat.label}</h3>
					<p className='text-3xl font-bold'>{stat.value}</p>
				</div>
			))}
		</div>
	);
}