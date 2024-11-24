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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
	isSubmitting,
}: {
	user?: User;
	onSubmit: (data: CreateUserData | UpdateUserData) => void;
	mode: 'create' | 'edit';
	isSubmitting: boolean;
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

			<Button type='submit' disabled={isSubmitting}>
				{isSubmitting ? (
					<div className='flex items-center gap-2'>
						<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
						{mode === 'create' ? 'Creating...' : 'Updating...'}
					</div>
				) : mode === 'create' ? (
					'Create User'
				) : (
					'Update User'
				)}
			</Button>
		</form>
	);
}

// DeleteConfirmDialog component
function DeleteConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	username,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	username: string;
}) {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete {username}? This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function AdminPage() {
	const queryClient = useQueryClient();
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	// TODO: Add search functionality
	// const [searchQuery, setSearchQuery] = useState('');
	// const filteredUsers = data?.filter(user =>
	//   user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
	//   user.email?.toLowerCase().includes(searchQuery.toLowerCase())
	// );

	// TODO: Add sorting
	// const [sortField, setSortField] = useState<keyof User>('id');
	// const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	// const sortedUsers = [...(data || [])].sort((a, b) => {
	//   if (sortDirection === 'asc') {
	//     return a[sortField] > b[sortField] ? 1 : -1;
	//   }
	//   return a[sortField] < b[sortField] ? 1 : -1;
	// });

	// TODO: Add pagination
	// const [page, setPage] = useState(1);
	// const itemsPerPage = 10;
	// const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
	// const paginatedUsers = data?.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	// TODO: Add filtering
	// const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
	// const [steamLinkedFilter, setSteamLinkedFilter] = useState<'ALL' | 'LINKED' | 'NOT_LINKED'>('ALL');
	// const filteredUsers = data?.filter(user => {
	//   if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
	//   if (steamLinkedFilter === 'LINKED' && !user.steamUser) return false;
	//   if (steamLinkedFilter === 'NOT_LINKED' && user.steamUser) return false;
	//   return true;
	// });

	const { data, isLoading, error } = useQuery<User[]>({
		queryKey: ['users'],
		queryFn: fetchUsers,
	});

	const createUserMutation = useMutation({
		mutationFn: (userData: CreateUserData) => createUser(userData),
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
		mutationFn: ({ id, ...userData }: UpdateUserData & { id: number }) =>
			updateUser(id, userData),
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
			setUserToDelete(null);
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
							isSubmitting={createUserMutation.isPending}
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
												isSubmitting={updateUserMutation.isPending}
											/>
										</DialogContent>
									</Dialog>

									<Button
										variant='destructive'
										size='sm'
										onClick={() => setUserToDelete(user)}
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

			<DeleteConfirmDialog
				isOpen={!!userToDelete}
				onClose={() => setUserToDelete(null)}
				onConfirm={() => {
					if (userToDelete) {
						deleteUserMutation.mutate(userToDelete.id);
					}
				}}
				username={userToDelete?.username || ''}
			/>
		</div>
	);
}

export default AdminPage;
