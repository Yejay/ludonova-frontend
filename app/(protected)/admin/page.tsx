'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, deleteUser } from '@/lib/api/users';
import type { User } from '@/types/user';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

function AdminPage() {
	const queryClient = useQueryClient();

	// Add console.log to check the API response
	const { data, isLoading, error } = useQuery<User[]>({
		queryKey: ['users'],
		queryFn: async () => {
			const response = await fetchUsers();
			console.log('API Response:', response); // Debug log
			// If the response is wrapped in a data property, extract it
			return response.content || response;
		},
	});

	const deleteUserMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User deleted successfully');
		},
		onError: (error) => {
			toast.error('Failed to delete user');
			console.error('Delete error:', error);
		},
	});

	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center text-red-500 p-4'>
				Error loading users:{' '}
				{error instanceof Error ? error.message : 'Unknown error'}
			</div>
		);
	}

	return (
		<div className='container mx-auto p-4 space-y-4'>
			<h1 className='text-2xl font-bold'>Admin Dashboard</h1>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Steam Profile</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.id}</TableCell>
							<TableCell>
								{user.steamUser?.personaName || user.username}
							</TableCell>
							<TableCell>{user.email || 'N/A'}</TableCell>
							<TableCell>
								{user.steamUser ? (
									<a
										href={user.steamUser.profileUrl}
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-2 hover:underline'
									>
										<Image
											src={user.steamUser.avatarUrl}
											alt='Steam avatar'
											width={24}
											height={24}
											className='w-6 h-6 rounded-full'
										/>
										{user.steamUser.steamId}
									</a>
								) : (
									'N/A'
								)}
							</TableCell>
							<TableCell>{user.role}</TableCell>
							<TableCell>
								<Button
									variant='destructive'
									size='sm'
									onClick={() => {
										if (
											window.confirm(
												'Are you sure you want to delete this user?'
											)
										) {
											deleteUserMutation.mutate(user.id);
										}
									}}
									disabled={deleteUserMutation.isPending}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default AdminPage;
