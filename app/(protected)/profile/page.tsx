'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Gamepad } from 'lucide-react';
import { fetchCurrentUser, updateUser } from '@/lib/api/users';
import { syncSteamLibrary } from '@/lib/api/steam';
import type { User } from '@/types/user';

function UserAvatar({ user, className }: { user: User; className?: string }) {
	return (
		<Avatar className={className}>
			<AvatarImage src={`https://avatar.vercel.sh/${user.username}`} alt={user.username} />
			<AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}

export default function ProfilePage() {
	const { toast } = useToast();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [formData, setFormData] = useState({
		username: '',
		email: '',
	});

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchCurrentUser();
				setUser(userData);
				setFormData({
					username: userData.username,
					email: userData.email,
				});
			} catch (error) {
				console.error('Error loading user:', error);
				toast({
					title: 'Error',
					description: 'Failed to load user data',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadUser();
	}, [toast]);

	const handleSyncLibrary = async () => {
		if (!user?.steamId) return;
		try {
			setIsSyncing(true);
			await syncSteamLibrary();
			toast({
				title: 'Success',
				description: 'Steam library synced successfully',
			});
		} catch (error) {
			console.error('Error syncing library:', error);
			toast({
				title: 'Error',
				description: 'Failed to sync Steam library',
				variant: 'destructive',
			});
		} finally {
			setIsSyncing(false);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		try {
			setIsUpdating(true);
			await updateUser(user.id, formData);
			toast({
				title: 'Success',
				description: 'Profile updated successfully',
			});
		} catch (error) {
			console.error('Error updating profile:', error);
			toast({
				title: 'Error',
				description: 'Failed to update profile',
				variant: 'destructive',
			});
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background'>
				<div className='max-w-2xl mx-auto p-8'>
					<div className='animate-pulse space-y-4'>
						<div className='h-32 bg-muted rounded-lg' />
						<div className='space-y-2'>
							<div className='h-4 w-1/4 bg-muted rounded' />
							<div className='h-10 bg-muted rounded' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className='min-h-screen bg-background'>
			<div className='max-w-2xl mx-auto p-8 space-y-8'>
				{/* Profile Header */}
				<div className='flex items-center gap-6 bg-card p-6 rounded-lg shadow-sm'>
					<UserAvatar user={user} className='w-24 h-24' />
					<div>
						<h1 className='text-2xl font-bold'>{user.username}</h1>
						<p className='text-muted-foreground'>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
					</div>
				</div>

				{/* Steam Connection */}
				<div className='bg-card p-6 rounded-lg shadow-sm space-y-4'>
					<h2 className='text-xl font-semibold'>Steam Connection</h2>
					{user.steamId ? (
						<div className='space-y-4'>
							<div className='flex items-center gap-2 text-muted-foreground'>
								<Gamepad className='w-4 h-4' />
								<span>Connected to Steam</span>
							</div>
							<Button
								variant='outline'
								onClick={handleSyncLibrary}
								disabled={isSyncing}
							>
								{isSyncing ? 'Syncing...' : 'Sync Steam Library'}
							</Button>
						</div>
					) : (
						<Button variant='outline' asChild>
							<a href='/api/auth/steam'>
								<Gamepad className='w-4 h-4 mr-2' />
								Connect Steam Account
							</a>
						</Button>
					)}
				</div>

				{/* Profile Settings */}
				<form onSubmit={handleUpdateProfile} className='bg-card p-6 rounded-lg shadow-sm space-y-6'>
					<h2 className='text-xl font-semibold'>Profile Settings</h2>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='username'>Username</Label>
							<Input
								id='username'
								value={formData.username}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, username: e.target.value }))
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
							/>
						</div>
					</div>
					<Button type='submit' disabled={isUpdating}>
						{isUpdating ? 'Saving...' : 'Save Changes'}
					</Button>
				</form>
			</div>
		</div>
	);
} 