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
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ArrowUpDown,
	Info,
} from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

function UserForm({ 
	user, 
	onSubmit, 
	mode,
	isSubmitting 
}: { 
	user?: User, 
	onSubmit: (data: CreateUserData | UpdateUserData) => void, 
	mode: 'create' | 'edit',
	isSubmitting: boolean 
}) {
	const [formData, setFormData] = useState<CreateUserData | UpdateUserData>(
		user || {
			username: '',
			email: '',
			role: 'USER',
			password: mode === 'create' ? '' : undefined,
			emailVerified: false
		}
	);

	return (
		<form 
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(formData);
			}} 
			className="space-y-4 px-1"
		>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Label htmlFor="username" className="text-sm">Username</Label>
					{mode === 'edit' && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className="h-3.5 w-3.5 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs">Usernames cannot be changed after account creation</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
				<Input
					id="username"
					value={formData.username || ''}
					onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
					required={mode === 'create'}
					disabled={mode === 'edit'}
					className={cn(
						"h-8 md:h-9 text-sm",
						mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''
					)}
				/>
			</div>
			
			<div className="space-y-2">
				<Label htmlFor="email" className="text-sm">Email</Label>
				<Input
					id="email"
					type="email"
					value={formData.email || ''}
					onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
					required={mode === 'create'}
					className="h-8 md:h-9 text-sm"
				/>
			</div>

			{mode === 'create' && (
				<>
					<div className="space-y-2">
						<Label htmlFor="password" className="text-sm">Password</Label>
						<Input
							id="password"
							type="password"
							value={(formData as CreateUserData).password || ''}
							onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
							required
							className="h-8 md:h-9 text-sm"
						/>
					</div>

					<div className="flex items-start space-x-2 pt-2">
						<Checkbox
							id="emailVerified"
							checked={(formData as CreateUserData).emailVerified}
							onCheckedChange={(checked: boolean | 'indeterminate') => 
								setFormData(prev => ({ 
									...prev, 
									emailVerified: checked === true 
								}))
							}
							className="mt-0.5"
						/>
						<div className="grid gap-1 leading-none">
							<Label
								htmlFor="emailVerified"
								className="text-sm font-medium leading-none cursor-pointer"
							>
								Pre-verify Email
							</Label>
							<p className="text-xs text-muted-foreground">
								Skip email verification for this user
							</p>
						</div>
					</div>
				</>
			)}

			<div className="space-y-2">
				<Label htmlFor="role" className="text-sm">Role</Label>
				<Select
					value={formData.role}
					onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'USER' | 'ADMIN' }))}
				>
					<SelectTrigger className="h-8 md:h-9 text-sm">
						<SelectValue placeholder="Select role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="USER">User</SelectItem>
						<SelectItem value="ADMIN">Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button 
				type="submit" 
				disabled={isSubmitting}
				className="w-full h-8 md:h-9 text-sm mt-6"
			>
				{isSubmitting ? (
					<div className="flex items-center gap-2">
						<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
						{mode === 'create' ? 'Creating...' : 'Updating...'}
					</div>
				) : (
					mode === 'create' ? 'Create User' : 'Update User'
				)}
			</Button>
		</form>
	);
}

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

	// Search state
	const [searchQuery, setSearchQuery] = useState('');

	// Filter states
	const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
	const [steamLinkedFilter, setSteamLinkedFilter] = useState<
		'ALL' | 'LINKED' | 'NOT_LINKED'
	>('ALL');

	// Sorting states
	const [sortField, setSortField] = useState<keyof User>('id');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	// Pagination state
	const [page, setPage] = useState(1);
	const itemsPerPage = 10; // Fixed items per page

	const { data, isLoading, error } = useQuery<User[]>({
		queryKey: ['users'],
		queryFn: fetchUsers,
	});

	const createUserMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User created successfully');
		},
		onError: (error) => {
			toast.error('Failed to create user');
			console.error('Failed to create user:', error);
		},
	});

	const updateUserMutation = useMutation({
		mutationFn: async ({ id, ...data }: UpdateUserData & { id: number }) => {
			await updateUser(id, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			setEditingUser(null);
			toast.success('User updated successfully');
		},
		onError: (error) => {
			toast.error('Failed to update user');
			console.error('Failed to update user:', error);
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
			console.error('Failed to delete user:', error);
		},
	});

	const handleSort = (field: keyof User) => {
		if (sortField === field) {
			setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const processData = (data: User[] | undefined) => {
		if (!data) return [];

		let filtered = [...data];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				user =>
					user.username.toLowerCase().includes(query) ||
					user.email.toLowerCase().includes(query)
			);
		}

		// Apply role filter
		if (roleFilter !== 'ALL') {
			filtered = filtered.filter(user => user.role === roleFilter);
		}

		// Apply Steam filter
		if (steamLinkedFilter !== 'ALL') {
			filtered = filtered.filter(user =>
				steamLinkedFilter === 'LINKED' ? user.steamUser : !user.steamUser
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			// Handle null values
			if (aValue === null || bValue === null) return 0;
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				return sortDirection === 'asc' 
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}
			// For numbers and other types
			if (aValue === bValue) return 0;
			const comparison = aValue < bValue ? -1 : 1;
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		return filtered;
	};

	const processedData = processData(data);
	const totalPages = Math.ceil(processedData.length / itemsPerPage);
	const currentPageData = processedData.slice(
		(page - 1) * itemsPerPage,
		page * itemsPerPage
	);

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
		<div className="container py-4 md:py-8 space-y-6">
			<h1 className="text-2xl md:text-4xl font-bold">Admin Dashboard</h1>

			<div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
				<div className="grid gap-4 md:grid-cols-4">
					<div className="space-y-2">
						<Label>Search</Label>
						<Input
							placeholder="Search users..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setPage(1);
							}}
							className="h-8 md:h-9 text-xs md:text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label>Role Filter</Label>
						<Select
							value={roleFilter}
							onValueChange={(value) => {
								setRoleFilter(value as typeof roleFilter);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Roles</SelectItem>
								<SelectItem value="USER">User</SelectItem>
								<SelectItem value="ADMIN">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Steam Account</Label>
						<Select
							value={steamLinkedFilter}
							onValueChange={(value) => {
								setSteamLinkedFilter(value as typeof steamLinkedFilter);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
								<SelectValue placeholder="Filter by Steam" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Users</SelectItem>
								<SelectItem value="LINKED">Steam Linked</SelectItem>
								<SelectItem value="NOT_LINKED">No Steam</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button className="w-full md:w-auto h-8 md:h-9 text-xs md:text-sm">Create New User</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
						</DialogHeader>
						<UserForm
							mode="create"
							onSubmit={(data) => createUserMutation.mutate(data as CreateUserData)}
							isSubmitting={createUserMutation.isPending}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-md border overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">#</TableHead>
							<TableHead>
								<button
									className="flex items-center gap-1 hover:text-accent-foreground text-xs md:text-sm"
									onClick={() => handleSort('username')}
								>
									User
									<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
								</button>
							</TableHead>
							<TableHead className="hidden md:table-cell">Email</TableHead>
							<TableHead>
								<button
									className="flex items-center gap-1 hover:text-accent-foreground text-xs md:text-sm"
									onClick={() => handleSort('role')}
								>
									Role
									<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
								</button>
							</TableHead>
							<TableHead className="hidden md:table-cell">Steam</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentPageData.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="text-xs md:text-sm font-medium">{user.id}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{user.steamUser?.avatarUrl && (
											<div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden">
												<Image
													src={user.steamUser.avatarUrl}
													alt={user.username}
													fill
													className="object-cover"
												/>
											</div>
										)}
										<div className="min-w-0">
											<p className="text-xs md:text-sm font-medium truncate">{user.username}</p>
											<p className="text-xs text-muted-foreground truncate md:hidden">{user.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden md:table-cell text-xs md:text-sm">
									{user.email}
								</TableCell>
								<TableCell>
									<span className={cn(
										"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
										user.role === 'ADMIN' 
											? "bg-primary/10 text-primary" 
											: "bg-muted text-muted-foreground"
									)}>
										{user.role}
									</span>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{user.steamUser ? (
										<span className="text-xs text-muted-foreground">
											{user.steamUser.personaName}
										</span>
									) : (
										<span className="text-xs text-muted-foreground">Not linked</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 md:h-8 md:w-8"
											onClick={() => setEditingUser(user)}
										>
											<span className="sr-only">Edit</span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												className="w-3 h-3 md:w-4 md:h-4"
											>
												<path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
												<path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
											</svg>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive"
											onClick={() => setUserToDelete(user)}
										>
											<span className="sr-only">Delete</span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												className="w-3 h-3 md:w-4 md:h-4"
											>
												<path
													fillRule="evenodd"
													d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
													clipRule="evenodd"
												/>
											</svg>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
				<div className="text-xs md:text-sm text-muted-foreground order-2 md:order-1">
					{processedData.length > 0
						? `Showing ${(page - 1) * itemsPerPage + 1} to ${Math.min(
								page * itemsPerPage,
								processedData.length
						  )} of ${processedData.length} users`
						: 'No users found'}
				</div>
				<div className="flex items-center space-x-2 order-1 md:order-2">
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 md:h-8 md:w-8"
						onClick={() => setPage(1)}
						disabled={page === 1}
					>
						<ChevronsLeft className="h-3 w-3 md:h-4 md:w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 md:h-8 md:w-8"
						onClick={() => setPage((prev) => Math.max(1, prev - 1))}
						disabled={page === 1}
					>
						<ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
					</Button>
					<div className="text-xs md:text-sm font-medium">
						Page {page} of {totalPages || 1}
					</div>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 md:h-8 md:w-8"
						onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
						disabled={page === totalPages || totalPages === 0}
					>
						<ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 md:h-8 md:w-8"
						onClick={() => setPage(totalPages)}
						disabled={page === totalPages || totalPages === 0}
					>
						<ChevronsRight className="h-3 w-3 md:h-4 md:w-4" />
					</Button>
				</div>
			</div>

			{/* Edit Dialog */}
			<Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>
					<UserForm
						mode="edit"
						user={editingUser || undefined}
						onSubmit={(data) =>
							updateUserMutation.mutate({
								id: editingUser?.id as number,
								...data as UpdateUserData
							})
						}
						isSubmitting={updateUserMutation.isPending}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<DeleteConfirmDialog
				isOpen={!!userToDelete}
				onClose={() => setUserToDelete(null)}
				onConfirm={() => {
					if (userToDelete) {
						deleteUserMutation.mutate(userToDelete.id);
						setUserToDelete(null);
					}
				}}
				username={userToDelete?.username || ''}
			/>
		</div>
	);
}

export default AdminPage;
