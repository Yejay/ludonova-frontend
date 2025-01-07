'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addGameToLibrary, updateGameStatus } from '@/lib/api/games';
import { GameStatus } from '@/types/game';

interface GameCardProps {
	game: {
		id: number;
		title: string;
		backgroundImage?: string;
		genres: string[];
		description?: string;
		releaseDate?: string;
		developer?: string;
		publisher?: string;
		platforms?: string[];
	};
	status?: GameStatus;
	instanceId?: number;
}

export function GameCard({ game, status, instanceId }: GameCardProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<GameStatus>(GameStatus.PLAN_TO_PLAY);

	const handleAddToLibrary = async () => {
		try {
			setIsLoading(true);
			console.log('Adding game to library:', { gameId: game.id, status: selectedStatus });
			const response = await addGameToLibrary({
				gameId: game.id,
				status: selectedStatus
			});
			console.log('Game added successfully:', response);
			
			// Redirect to dashboard after successful addition
			window.location.href = '/dashboard';
			
			toast({
				title: 'Success',
				description: `${game.title} has been added to your library.`,
			});
		} catch (error) {
			console.error('Error adding game to library:', error);
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to add game to library. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateStatus = async (newStatus: GameStatus) => {
		if (!instanceId) return;
		try {
			setIsLoading(true);
			await updateGameStatus(instanceId, newStatus);
			toast({
				title: 'Success',
				description: `${game.title} status updated to ${getStatusDisplayName(newStatus)}.`,
			});
		} catch (error) {
			console.error('Error updating game status:', error);
			toast({
				title: 'Error',
				description: 'Failed to update game status. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusColor = (status: GameStatus) => {
		switch (status) {
			case GameStatus.PLAYING:
				return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
			case GameStatus.COMPLETED:
				return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
			case GameStatus.DROPPED:
				return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
			case GameStatus.PLAN_TO_PLAY:
				return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
			default:
				return 'bg-muted';
		}
	};

	const getStatusDisplayName = (status: GameStatus): string => {
		switch (status) {
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
		<div className='group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
			<div className='aspect-[16/9] relative bg-muted'>
				<Image
					src={game.backgroundImage || '/placeholder-game.jpg'}
					alt={game.title}
					fill
					className='object-cover'
				/>
			</div>
			<div className='p-4'>
				<h3 className='font-semibold truncate mb-2'>{game.title}</h3>
				{status ? (
					<Select defaultValue={status} onValueChange={handleUpdateStatus}>
						<SelectTrigger className={`w-full ${getStatusColor(status)}`}>
							<SelectValue placeholder='Select status'>
								{getStatusDisplayName(status)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={GameStatus.PLAYING}>{getStatusDisplayName(GameStatus.PLAYING)}</SelectItem>
							<SelectItem value={GameStatus.COMPLETED}>{getStatusDisplayName(GameStatus.COMPLETED)}</SelectItem>
							<SelectItem value={GameStatus.DROPPED}>{getStatusDisplayName(GameStatus.DROPPED)}</SelectItem>
							<SelectItem value={GameStatus.PLAN_TO_PLAY}>{getStatusDisplayName(GameStatus.PLAN_TO_PLAY)}</SelectItem>
						</SelectContent>
					</Select>
				) : (
					<Dialog>
						<DialogTrigger asChild>
							<Button className='w-full' variant='outline'>
								Add to Library
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add to Library</DialogTitle>
							</DialogHeader>
							<div className='space-y-4 py-4'>
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Status</label>
									<Select
										value={selectedStatus}
										onValueChange={(value: string) => setSelectedStatus(value as GameStatus)}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select status'>
												{getStatusDisplayName(selectedStatus)}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={GameStatus.PLAYING}>{getStatusDisplayName(GameStatus.PLAYING)}</SelectItem>
											<SelectItem value={GameStatus.COMPLETED}>{getStatusDisplayName(GameStatus.COMPLETED)}</SelectItem>
											<SelectItem value={GameStatus.DROPPED}>{getStatusDisplayName(GameStatus.DROPPED)}</SelectItem>
											<SelectItem value={GameStatus.PLAN_TO_PLAY}>{getStatusDisplayName(GameStatus.PLAN_TO_PLAY)}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button
									className='w-full'
									onClick={handleAddToLibrary}
									disabled={isLoading}
								>
									{isLoading ? 'Adding...' : 'Add to Library'}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				)}
				<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
					<Button
						variant='ghost'
						size='sm'
						className='bg-background/50 backdrop-blur-sm hover:bg-background/80'
						asChild
					>
						<a href={`/games/${game.id}`}>View Details</a>
					</Button>
				</div>
			</div>
		</div>
	);
} 