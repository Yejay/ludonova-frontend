// 'use client';

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import {
// 	fetchUsers,
// 	deleteUser,
// 	updateUser,
// 	createUser,
// } from '@/lib/api/users';
// import type { User, CreateUserData, UpdateUserData } from '@/types/user';
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
// import Image from 'next/image';
// import { useState } from 'react';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from '@/components/ui/dialog';
// import {
// 	AlertDialog,
// 	AlertDialogAction,
// 	AlertDialogCancel,
// 	AlertDialogContent,
// 	AlertDialogDescription,
// 	AlertDialogFooter,
// 	AlertDialogHeader,
// 	AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select';

// function UserForm({
// 	user,
// 	onSubmit,
// 	mode,
// 	isSubmitting,
// }: {
// 	user?: User;
// 	onSubmit: (data: CreateUserData | UpdateUserData) => void;
// 	mode: 'create' | 'edit';
// 	isSubmitting: boolean;
// }) {
// 	const [formData, setFormData] = useState<CreateUserData | UpdateUserData>(
// 		user || {
// 			username: '',
// 			email: '',
// 			role: 'USER',
// 			password: mode === 'create' ? '' : undefined,
// 		}
// 	);

// 	return (
// 		<form
// 			onSubmit={(e) => {
// 				e.preventDefault();
// 				onSubmit(formData);
// 			}}
// 			className='space-y-4'
// 		>
// 			<div>
// 				<Label htmlFor='username'>Username</Label>
// 				<Input
// 					id='username'
// 					value={formData.username || ''}
// 					onChange={(e) =>
// 						setFormData((prev) => ({ ...prev, username: e.target.value }))
// 					}
// 					required={mode === 'create'}
// 				/>
// 			</div>

// 			<div>
// 				<Label htmlFor='email'>Email</Label>
// 				<Input
// 					id='email'
// 					type='email'
// 					value={formData.email || ''}
// 					onChange={(e) =>
// 						setFormData((prev) => ({ ...prev, email: e.target.value }))
// 					}
// 					required={mode === 'create'}
// 				/>
// 			</div>

// 			{mode === 'create' && (
// 				<div>
// 					<Label htmlFor='password'>Password</Label>
// 					<Input
// 						id='password'
// 						type='password'
// 						value={(formData as CreateUserData).password || ''}
// 						onChange={(e) =>
// 							setFormData((prev) => ({ ...prev, password: e.target.value }))
// 						}
// 						required
// 					/>
// 				</div>
// 			)}

// 			<div>
// 				<Label htmlFor='role'>Role</Label>
// 				<Select
// 					value={formData.role}
// 					onValueChange={(value) =>
// 						setFormData((prev) => ({
// 							...prev,
// 							role: value as 'USER' | 'ADMIN',
// 						}))
// 					}
// 				>
// 					<SelectTrigger>
// 						<SelectValue placeholder='Select role' />
// 					</SelectTrigger>
// 					<SelectContent>
// 						<SelectItem value='USER'>User</SelectItem>
// 						<SelectItem value='ADMIN'>Admin</SelectItem>
// 					</SelectContent>
// 				</Select>
// 			</div>

// 			<Button type='submit' disabled={isSubmitting}>
// 				{isSubmitting ? (
// 					<div className='flex items-center gap-2'>
// 						<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
// 						{mode === 'create' ? 'Creating...' : 'Updating...'}
// 					</div>
// 				) : mode === 'create' ? (
// 					'Create User'
// 				) : (
// 					'Update User'
// 				)}
// 			</Button>
// 		</form>
// 	);
// }

// // DeleteConfirmDialog component
// function DeleteConfirmDialog({
// 	isOpen,
// 	onClose,
// 	onConfirm,
// 	username,
// }: {
// 	isOpen: boolean;
// 	onClose: () => void;
// 	onConfirm: () => void;
// 	username: string;
// }) {
// 	return (
// 		<AlertDialog open={isOpen} onOpenChange={onClose}>
// 			<AlertDialogContent>
// 				<AlertDialogHeader>
// 					<AlertDialogTitle>Delete User</AlertDialogTitle>
// 					<AlertDialogDescription>
// 						Are you sure you want to delete {username}? This action cannot be
// 						undone.
// 					</AlertDialogDescription>
// 				</AlertDialogHeader>
// 				<AlertDialogFooter>
// 					<AlertDialogCancel>Cancel</AlertDialogCancel>
// 					<AlertDialogAction
// 						onClick={onConfirm}
// 						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
// 					>
// 						Delete
// 					</AlertDialogAction>
// 				</AlertDialogFooter>
// 			</AlertDialogContent>
// 		</AlertDialog>
// 	);
// }

// function AdminPage() {
// 	const queryClient = useQueryClient();
// 	const [editingUser, setEditingUser] = useState<User | null>(null);
// 	const [userToDelete, setUserToDelete] = useState<User | null>(null);

// 	// TODO: Add search functionality
// 	// const [searchQuery, setSearchQuery] = useState('');
// 	// const filteredUsers = data?.filter(user =>
// 	//   user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 	//   user.email?.toLowerCase().includes(searchQuery.toLowerCase())
// 	// );

// 	// TODO: Add sorting
// 	// const [sortField, setSortField] = useState<keyof User>('id');
// 	// const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
// 	// const sortedUsers = [...(data || [])].sort((a, b) => {
// 	//   if (sortDirection === 'asc') {
// 	//     return a[sortField] > b[sortField] ? 1 : -1;
// 	//   }
// 	//   return a[sortField] < b[sortField] ? 1 : -1;
// 	// });

// 	// TODO: Add pagination
// 	// const [page, setPage] = useState(1);
// 	// const itemsPerPage = 10;
// 	// const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
// 	// const paginatedUsers = data?.slice((page - 1) * itemsPerPage, page * itemsPerPage);

// 	// TODO: Add filtering
// 	// const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
// 	// const [steamLinkedFilter, setSteamLinkedFilter] = useState<'ALL' | 'LINKED' | 'NOT_LINKED'>('ALL');
// 	// const filteredUsers = data?.filter(user => {
// 	//   if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
// 	//   if (steamLinkedFilter === 'LINKED' && !user.steamUser) return false;
// 	//   if (steamLinkedFilter === 'NOT_LINKED' && user.steamUser) return false;
// 	//   return true;
// 	// });

// 	const { data, isLoading, error } = useQuery<User[]>({
// 		queryKey: ['users'],
// 		queryFn: fetchUsers,
// 	});

// 	const createUserMutation = useMutation({
// 		mutationFn: (userData: CreateUserData) => createUser(userData),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['users'] });
// 			toast.success('User created successfully');
// 		},
// 		onError: (error) => {
// 			toast.error('Failed to create user');
// 			console.error('Create error:', error);
// 		},
// 	});

// 	const updateUserMutation = useMutation({
// 		mutationFn: ({ id, ...userData }: UpdateUserData & { id: number }) =>
// 			updateUser(id, userData),
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['users'] });
// 			toast.success('User updated successfully');
// 			setEditingUser(null);
// 		},
// 		onError: (error) => {
// 			toast.error('Failed to update user');
// 			console.error('Update error:', error);
// 		},
// 	});

// 	const deleteUserMutation = useMutation({
// 		mutationFn: deleteUser,
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['users'] });
// 			toast.success('User deleted successfully');
// 			setUserToDelete(null);
// 		},
// 		onError: (error) => {
// 			toast.error('Failed to delete user');
// 			console.error('Delete error:', error);
// 		},
// 	});

// 	if (isLoading) {
// 		return (
// 			<div className='flex justify-center items-center min-h-screen'>
// 				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900' />
// 			</div>
// 		);
// 	}

// 	if (error) {
// 		return (
// 			<div className='text-center text-red-500 p-4'>
// 				Error loading users:{' '}
// 				{error instanceof Error ? error.message : 'Unknown error'}
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className='container mx-auto p-4 space-y-4'>
// 			<div className='flex justify-between items-center'>
// 				<h1 className='text-2xl font-bold'>Admin Dashboard</h1>
// 				<Dialog>
// 					<DialogTrigger asChild>
// 						<Button>Create New User</Button>
// 					</DialogTrigger>
// 					<DialogContent>
// 						<DialogHeader>
// 							<DialogTitle>Create New User</DialogTitle>
// 						</DialogHeader>
// 						<UserForm
// 							mode='create'
// 							onSubmit={(data) =>
// 								createUserMutation.mutate(data as CreateUserData)
// 							}
// 							isSubmitting={createUserMutation.isPending}
// 						/>
// 					</DialogContent>
// 				</Dialog>
// 			</div>

// 			<Table>
// 				<TableHeader>
// 					<TableRow>
// 						<TableHead>ID</TableHead>
// 						<TableHead>Name</TableHead>
// 						<TableHead>Email</TableHead>
// 						<TableHead>Steam Profile</TableHead>
// 						<TableHead>Role</TableHead>
// 						<TableHead>Actions</TableHead>
// 					</TableRow>
// 				</TableHeader>
// 				<TableBody>
// 					{data?.map((user) => (
// 						<TableRow key={user.id}>
// 							<TableCell>{user.id}</TableCell>
// 							<TableCell>
// 								{user.steamUser?.personaName || user.username}
// 							</TableCell>
// 							<TableCell>{user.email || 'N/A'}</TableCell>
// 							<TableCell>
// 								{user.steamUser ? (
// 									<a
// 										href={user.steamUser.profileUrl}
// 										target='_blank'
// 										rel='noopener noreferrer'
// 										className='flex items-center gap-2 hover:underline'
// 									>
// 										<Image
// 											src={user.steamUser.avatarUrl}
// 											alt='Steam avatar'
// 											width={24}
// 											height={24}
// 											className='w-6 h-6 rounded-full'
// 										/>
// 										{user.steamUser.steamId}
// 									</a>
// 								) : (
// 									'N/A'
// 								)}
// 							</TableCell>
// 							<TableCell>{user.role}</TableCell>
// 							<TableCell>
// 								<div className='flex gap-2'>
// 									<Dialog>
// 										<DialogTrigger asChild>
// 											<Button
// 												variant='outline'
// 												size='sm'
// 												onClick={() => setEditingUser(user)}
// 											>
// 												Edit
// 											</Button>
// 										</DialogTrigger>
// 										<DialogContent>
// 											<DialogHeader>
// 												<DialogTitle>Edit User</DialogTitle>
// 											</DialogHeader>
// 											<UserForm
// 												mode='edit'
// 												user={user}
// 												onSubmit={(data) =>
// 													updateUserMutation.mutate({
// 														id: user.id,
// 														...(data as UpdateUserData),
// 													})
// 												}
// 												isSubmitting={updateUserMutation.isPending}
// 											/>
// 										</DialogContent>
// 									</Dialog>

// 									<Button
// 										variant='destructive'
// 										size='sm'
// 										onClick={() => setUserToDelete(user)}
// 										disabled={deleteUserMutation.isPending}
// 									>
// 										Delete
// 									</Button>
// 								</div>
// 							</TableCell>
// 						</TableRow>
// 					))}
// 				</TableBody>
// 			</Table>

// 			<DeleteConfirmDialog
// 				isOpen={!!userToDelete}
// 				onClose={() => setUserToDelete(null)}
// 				onConfirm={() => {
// 					if (userToDelete) {
// 						deleteUserMutation.mutate(userToDelete.id);
// 					}
// 				}}
// 				username={userToDelete?.username || ''}
// 			/>
// 		</div>
// 	);
// }

// export default AdminPage;

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
} from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

// function UserForm({
// 	user,
// 	onSubmit,
// 	mode,
// 	isSubmitting,
// }: {
// 	user?: User;
// 	onSubmit: (data: CreateUserData | UpdateUserData) => void;
// 	mode: 'create' | 'edit';
// 	isSubmitting: boolean;
// }) {
// 	const [formData, setFormData] = useState<CreateUserData | UpdateUserData>(
// 		user || {
// 			username: '',
// 			email: '',
// 			role: 'USER',
// 			password: mode === 'create' ? '' : undefined,
// 		}
// 	);

// 	return (
// 		<form
// 			onSubmit={(e) => {
// 				e.preventDefault();
// 				onSubmit(formData);
// 			}}
// 			className='space-y-4'
// 		>
// 			<div>
// 				<Label htmlFor='username'>Username</Label>
// 				<Input
// 					id='username'
// 					value={formData.username || ''}
// 					onChange={(e) =>
// 						setFormData((prev) => ({ ...prev, username: e.target.value }))
// 					}
// 					required={mode === 'create'}
// 				/>
// 			</div>

// 			<div>
// 				<Label htmlFor='email'>Email</Label>
// 				<Input
// 					id='email'
// 					type='email'
// 					value={formData.email || ''}
// 					onChange={(e) =>
// 						setFormData((prev) => ({ ...prev, email: e.target.value }))
// 					}
// 					required={mode === 'create'}
// 				/>
// 			</div>

// 			{mode === 'create' && (
// 				<div>
// 					<Label htmlFor='password'>Password</Label>
// 					<Input
// 						id='password'
// 						type='password'
// 						value={(formData as CreateUserData).password || ''}
// 						onChange={(e) =>
// 							setFormData((prev) => ({ ...prev, password: e.target.value }))
// 						}
// 						required
// 					/>
// 				</div>
// 			)}

// 			<div>
// 				<Label htmlFor='role'>Role</Label>
// 				<Select
// 					value={formData.role}
// 					onValueChange={(value) =>
// 						setFormData((prev) => ({
// 							...prev,
// 							role: value as 'USER' | 'ADMIN',
// 						}))
// 					}
// 				>
// 					<SelectTrigger>
// 						<SelectValue placeholder='Select role' />
// 					</SelectTrigger>
// 					<SelectContent>
// 						<SelectItem value='USER'>User</SelectItem>
// 						<SelectItem value='ADMIN'>Admin</SelectItem>
// 					</SelectContent>
// 				</Select>
// 			</div>

// 			<Button type='submit' disabled={isSubmitting}>
// 				{isSubmitting ? (
// 					<div className='flex items-center gap-2'>
// 						<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
// 						{mode === 'create' ? 'Creating...' : 'Updating...'}
// 					</div>
// 				) : mode === 'create' ? (
// 					'Create User'
// 				) : (
// 					'Update User'
// 				)}
// 			</Button>
// 		</form>
// 	);
// }

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
        password: mode === 'create' ? '' : undefined
      }
    );
  
    return (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} 
        className="space-y-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="username">Username</Label>
            {mode === 'edit' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Usernames cannot be changed after account creation</p>
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
            className={mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required={mode === 'create'}
          />
        </div>
  
        {mode === 'create' && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={(formData as CreateUserData).password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
        )}
  
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'USER' | 'ADMIN' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
  
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

	// Pagination states
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

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

	const handleSort = (field: keyof User) => {
		if (sortField === field) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const processData = (data: User[] | undefined) => {
		if (!data) return [];

		let processed = [...data];

		// // Apply search filter
		// if (searchQuery) {
		// 	processed = processed.filter(
		// 		(user) =>
		// 			user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
		// 			user.email?.toLowerCase().includes(searchQuery.toLowerCase())
		// 	);
		// }

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase().trim();
			processed = processed.filter(
				(user) =>
					// Search in username
					user.username.toLowerCase().includes(query) ||
					// Search in email
					(user.email?.toLowerCase().includes(query) ?? false) ||
					// Search in Steam username
					(user.steamUser?.personaName.toLowerCase().includes(query) ??
						false) ||
					// Search in Steam ID
					(user.steamUser?.steamId.toLowerCase().includes(query) ?? false) ||
					// Search in role
					user.role.toLowerCase().includes(query) ||
					// Search in ID (convert to string first)
					user.id.toString().includes(query)
			);
		}

		// Apply role filter
		if (roleFilter !== 'ALL') {
			processed = processed.filter((user) => user.role === roleFilter);
		}

		// Apply Steam filter
		if (steamLinkedFilter !== 'ALL') {
			processed = processed.filter((user) =>
				steamLinkedFilter === 'LINKED' ? user.steamUser : !user.steamUser
			);
		}

		// Apply sorting
		processed.sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			if (sortDirection === 'asc') {
				return aValue > bValue ? 1 : -1;
			}
			return aValue < bValue ? 1 : -1;
		});

		return processed;
	};

	const processedData = processData(data);
	const totalItems = processedData.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginatedData = processedData.slice(
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

			<div className='grid gap-4 md:grid-cols-4'>
				<div className='space-y-2'>
					<Label>Search</Label>
					<Input
						placeholder='Search users...'
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setPage(1); // Reset to first page on search
						}}
						className='w-full'
					/>
				</div>

				<div className='space-y-2'>
					<Label>Role Filter</Label>
					<Select
						value={roleFilter}
						onValueChange={(value) => {
							setRoleFilter(value as typeof roleFilter);
							setPage(1);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='Filter by role' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>All Roles</SelectItem>
							<SelectItem value='USER'>User</SelectItem>
							<SelectItem value='ADMIN'>Admin</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label>Steam Account</Label>
					<Select
						value={steamLinkedFilter}
						onValueChange={(value) => {
							setSteamLinkedFilter(value as typeof steamLinkedFilter);
							setPage(1);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='Filter by Steam' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>All Users</SelectItem>
							<SelectItem value='LINKED'>Steam Linked</SelectItem>
							<SelectItem value='NOT_LINKED'>No Steam</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label>Items per Page</Label>
					<Select
						value={itemsPerPage.toString()}
						onValueChange={(value) => {
							setItemsPerPage(Number(value));
							setPage(1);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='Items per page' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='5'>5</SelectItem>
							<SelectItem value='10'>10</SelectItem>
							<SelectItem value='20'>20</SelectItem>
							<SelectItem value='50'>50</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<Button
								variant='ghost'
								onClick={() => handleSort('id')}
								className='flex items-center'
							>
								ID{' '}
								{sortField === 'id' && (
									<ArrowUpDown
										className={`ml-2 h-4 w-4 ${
											sortDirection === 'desc' ? 'rotate-180' : ''
										}`}
									/>
								)}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant='ghost'
								onClick={() => handleSort('username')}
								className='flex items-center'
							>
								Name{' '}
								{sortField === 'username' && (
									<ArrowUpDown
										className={`ml-2 h-4 w-4 ${
											sortDirection === 'desc' ? 'rotate-180' : ''
										}`}
									/>
								)}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant='ghost'
								onClick={() => handleSort('email')}
								className='flex items-center'
							>
								Email{' '}
								{sortField === 'email' && (
									<ArrowUpDown
										className={`ml-2 h-4 w-4 ${
											sortDirection === 'desc' ? 'rotate-180' : ''
										}`}
									/>
								)}
							</Button>
						</TableHead>
						<TableHead>Steam Profile</TableHead>
						<TableHead>
							<Button
								variant='ghost'
								onClick={() => handleSort('role')}
								className='flex items-center'
							>
								Role{' '}
								{sortField === 'role' && (
									<ArrowUpDown
										className={`ml-2 h-4 w-4 ${
											sortDirection === 'desc' ? 'rotate-180' : ''
										}`}
									/>
								)}
							</Button>
						</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedData.map((user) => (
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

			{/* Pagination Controls */}
			<div className='flex items-center justify-between py-4'>
				<div className='flex-1 text-sm text-muted-foreground'>
					{processedData.length > 0
						? `Showing ${(page - 1) * itemsPerPage + 1} to ${Math.min(
								page * itemsPerPage,
								processedData.length
						  )} of ${processedData.length} users`
						: 'No users found'}
				</div>
				<div className='flex items-center space-x-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage(1)}
						disabled={page === 1}
					>
						<ChevronsLeft className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((prev) => Math.max(1, prev - 1))}
						disabled={page === 1}
					>
						<ChevronLeft className='h-4 w-4' />
					</Button>
					<div className='text-sm font-medium'>
						Page {page} of {totalPages || 1}
					</div>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
						disabled={page === totalPages || totalPages === 0}
					>
						<ChevronRight className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage(totalPages)}
						disabled={page === totalPages || totalPages === 0}
					>
						<ChevronsRight className='h-4 w-4' />
					</Button>
				</div>
			</div>

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
