'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '@/lib/api/users';
import type { User } from '@/types/user';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Gamepad } from 'lucide-react';

export function UserProfile() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchCurrentUser();
				setUser(userData);
			} catch (error) {
				console.error('Error loading user:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUser();
	}, []);

	if (isLoading) {
		return (
			<div className='animate-pulse flex items-center gap-4'>
				<div className='w-16 h-16 rounded-full bg-muted' />
				<div className='space-y-2'>
					<div className='h-4 w-48 bg-muted rounded' />
					<div className='h-3 w-32 bg-muted rounded' />
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-4'>
				<UserAvatar user={user} className='w-16 h-16' />
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
					<Button variant='outline' className='gap-2'>
						<Gamepad className='w-4 h-4' />
						Connect Steam
					</Button>
				)}
				<Button variant='outline'>Edit Profile</Button>
			</div>
		</div>
	);
} 