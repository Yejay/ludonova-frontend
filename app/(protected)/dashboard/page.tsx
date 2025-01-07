// app/(protected)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Gamepad } from 'lucide-react';
import { fetchCurrentUser } from '@/lib/api/users';
import { fetchUserGameInstances, fetchUserGameInstancesByStatus } from '@/lib/api/games';
import { GameCard } from '@/components/games/GameCard';
import { GameGridSkeleton } from '@/components/games/GameGridSkeleton';
import { DashboardStats } from '@/components/dashboard/stats';
import type { User } from '@/types/user';
import { GameStatus } from '@/types/game';
import type { GameInstance, PageResponse } from '@/types/game';

function UserProfile({ user }: { user: User }) {
	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-4'>
				<Avatar className='w-16 h-16'>
					<AvatarImage src={`https://avatar.vercel.sh/${user.username}`} alt={user.username} />
					<AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div>
					<h1 className='text-2xl font-bold'>{user.username}</h1>
					<p className='text-muted-foreground'>{user.email}</p>
				</div>
			</div>
			<div className='flex items-center gap-4'>
				{user.steamId ? (
					<Button variant='outline' className='gap-2'>
						<Gamepad className='w-4 h-4' />
						Steam Connected
					</Button>
				) : (
					<Button variant='outline' asChild>
						<a href='/api/auth/steam'>
							<Gamepad className='w-4 h-4' />
							Connect Steam
						</a>
					</Button>
				)}
				<Button variant='outline' asChild>
					<a href='/profile'>Edit Profile</a>
				</Button>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const { toast } = useToast();
	const [user, setUser] = useState<User | null>(null);
	const [gameInstances, setGameInstances] = useState<GameInstance[]>([]);
	const [status, setStatus] = useState<GameStatus | 'all'>('all');
	const [isLoading, setIsLoading] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	const loadDashboardData = async () => {
		try {
			setIsLoading(true);
			console.log('Loading dashboard data...');
			const [userData, gamesData] = await Promise.all([
				fetchCurrentUser(),
				status === 'all'
					? fetchUserGameInstances()
					: fetchUserGameInstancesByStatus(status)
			]);

			console.log('Received games data:', gamesData);
			
			// Type guard to check if response is paginated
			const isPaginatedResponse = (data: GameInstance[] | PageResponse<GameInstance>): 
				data is PageResponse<GameInstance> => {
				return 'content' in data;
			};

			const instances = isPaginatedResponse(gamesData) ? gamesData.content : gamesData;
			
			console.log('Game instances:', instances);
			setUser(userData);
			setGameInstances(instances);
		} catch (error) {
			console.error('Error loading dashboard data:', error);
			toast({
				title: 'Error',
				description: 'Failed to load dashboard data',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Effect for initial load and status changes
	useEffect(() => {
		loadDashboardData();
	}, [status, refreshKey]);

	// Effect to refresh data when returning to the page
	useEffect(() => {
		const handleFocus = () => {
			console.log('Window focused, refreshing data...');
			setRefreshKey(prev => prev + 1);
		};

		window.addEventListener('focus', handleFocus);
		return () => window.removeEventListener('focus', handleFocus);
	}, []);

	// Calculate stats from game instances
	const stats = {
		totalGames: gameInstances.length,
		playing: gameInstances.filter(gi => gi.status === GameStatus.PLAYING).length,
		completed: gameInstances.filter(gi => gi.status === GameStatus.COMPLETED).length,
		plan_to_play: gameInstances.filter(gi => gi.status === GameStatus.PLAN_TO_PLAY).length,
		dropped: gameInstances.filter(gi => gi.status === GameStatus.DROPPED).length,
	};

	const getStatusDisplayName = (status: GameStatus | 'all'): string => {
		switch (status) {
			case 'all':
				return 'All Games';
			case GameStatus.PLAYING:
				return 'Playing';
			case GameStatus.COMPLETED:
				return 'Completed';
			case GameStatus.DROPPED:
				return 'Dropped';
			case GameStatus.PLAN_TO_PLAY:
				return 'Plan to Play';
			default:
				return status;
		}
	};

	return (
		<div className='min-h-screen bg-background'>
			<div className='max-w-7xl mx-auto p-8 space-y-8'>
				{/* User Profile Section */}
				<section className='bg-card rounded-lg p-6 shadow-sm'>
					{user && <UserProfile user={user} />}
				</section>

				{/* Stats Overview */}
				<section className='grid gap-4'>
					<h2 className='text-xl font-semibold'>Overview</h2>
					<DashboardStats stats={stats} isLoading={isLoading} />
				</section>

				{/* Games Grid Section */}
				<section className='space-y-6'>
					<div className='flex justify-between items-center'>
						<h2 className='text-xl font-semibold'>Your Games</h2>
						<div className='flex items-center gap-4'>
							<Select value={status} onValueChange={(value) => setStatus(value as GameStatus | 'all')}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Filter by status'>
										{getStatusDisplayName(status)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Games</SelectItem>
									<SelectItem value={GameStatus.PLAYING}>{getStatusDisplayName(GameStatus.PLAYING)}</SelectItem>
									<SelectItem value={GameStatus.COMPLETED}>{getStatusDisplayName(GameStatus.COMPLETED)}</SelectItem>
									<SelectItem value={GameStatus.DROPPED}>{getStatusDisplayName(GameStatus.DROPPED)}</SelectItem>
									<SelectItem value={GameStatus.PLAN_TO_PLAY}>{getStatusDisplayName(GameStatus.PLAN_TO_PLAY)}</SelectItem>
								</SelectContent>
							</Select>
							<Button variant='outline' asChild>
								<a href='/games' className='text-primary hover:underline'>
									Browse Games
								</a>
							</Button>
						</div>
					</div>

					{isLoading ? (
						<GameGridSkeleton />
					) : !gameInstances.length ? (
						<div className='text-center py-12 bg-card rounded-lg'>
							<h3 className='text-lg font-semibold mb-2'>No games in your library yet</h3>
							<p className='text-muted-foreground mb-4'>
								Start building your collection by browsing our game catalog
							</p>
							<Button variant='outline' asChild>
								<a href='/games' className='font-semibold'>
									Browse Games →
								</a>
							</Button>
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
							{gameInstances.map((gameInstance) => (
								<GameCard 
									key={gameInstance.id} 
									game={{
										id: gameInstance.gameId,
										title: gameInstance.gameTitle,
										backgroundImage: gameInstance.backgroundImage,
										genres: gameInstance.genres,
										description: '',
										releaseDate: '',
										developer: '',
										publisher: '',
										platforms: []
									}}
									status={gameInstance.status}
									instanceId={gameInstance.id}
								/>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
