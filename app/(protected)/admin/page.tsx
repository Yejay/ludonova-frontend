'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	fetchUsers,
	deleteUser,
	updateUser,
	createUser,
} from '@/lib/api/users';
import type { User, CreateUserData, UpdateUserData } from '@/types/user';
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
import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

function UserForm({
	user,
	onSubmit,
	mode,
}: {
	user?: User;
	onSubmit: (data: CreateUserData | UpdateUserData) => void;
	mode: 'create' | 'edit';
}) {
	const [formData, setFormData] = useState<CreateUserData | UpdateUserData>(
		user || {
			username: '',
			email: '',
			role: 'USER',
			password: mode === 'create' ? '' : undefined,
		}
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(formData);
			}}
			className='space-y-4'
		>
			<div>
				<Label htmlFor='username'>Username</Label>
				<Input
					id='username'
					value={formData.username || ''}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, username: e.target.value }))
					}
					required={mode === 'create'}
				/>
			</div>

			<div>
				<Label htmlFor='email'>Email</Label>
				<Input
					id='email'
					type='email'
					value={formData.email || ''}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, email: e.target.value }))
					}
					required={mode === 'create'}
				/>
			</div>

			{mode === 'create' && (
				<div>
					<Label htmlFor='password'>Password</Label>
					<Input
						id='password'
						type='password'
						value={(formData as CreateUserData).password || ''}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, password: e.target.value }))
						}
						required
					/>
				</div>
			)}

			<div>
				<Label htmlFor='role'>Role</Label>
				<Select
					value={formData.role}
					onValueChange={(value) =>
						setFormData((prev) => ({
							...prev,
							role: value as 'USER' | 'ADMIN',
						}))
					}
				>
					<SelectTrigger>
						<SelectValue placeholder='Select role' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='USER'>User</SelectItem>
						<SelectItem value='ADMIN'>Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button type='submit'>
				{mode === 'create' ? 'Create User' : 'Update User'}
			</Button>
		</form>
	);
}

function AdminPage() {
	const queryClient = useQueryClient();
	const [editingUser, setEditingUser] = useState<User | null>(null);

	const { data, isLoading, error } = useQuery<User[]>({
		queryKey: ['users'],
		queryFn: fetchUsers,
	});

	const createUserMutation = useMutation({
		mutationFn: (userData: CreateUserData) => {
			console.log('Creating user with data:', userData);
			return createUser(userData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User created successfully');
		},
		onError: (error) => {
			toast.error('Failed to create user');
			console.error('Create error:', error);
		},
	});

	const updateUserMutation = useMutation({
		mutationFn: ({ id, ...userData }: UpdateUserData & { id: number }) => {
			console.log('Updating user with id:', id, 'and data:', userData);
			return updateUser(id, userData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User updated successfully');
			setEditingUser(null);
		},
		onError: (error) => {
			toast.error('Failed to update user');
			console.error('Update error:', error);
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
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold'>Admin Dashboard</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>Create New User</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
						</DialogHeader>
						<UserForm
							mode='create'
							onSubmit={(data) =>
								createUserMutation.mutate(data as CreateUserData)
							}
						/>
					</DialogContent>
				</Dialog>
			</div>

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
								<div className='flex gap-2'>
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												onClick={() => setEditingUser(user)}
											>
												Edit
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit User</DialogTitle>
											</DialogHeader>
											<UserForm
												mode='edit'
												user={user}
												onSubmit={(data) =>
													updateUserMutation.mutate({
														id: user.id,
														...(data as UpdateUserData),
													})
												}
											/>
										</DialogContent>
									</Dialog>

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
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export default AdminPage;
