// import { api } from './client';
// import type { UserResponse } from '@/types/user';

// export async function fetchUsers() {
//   const { data } = await api.get<UserResponse>('/user');
//   return data;
// }

// export async function deleteUser(id: number) {
//   await api.delete(`/user/${id}`);
// }

import { api } from './client';
import type { User, UserResponse, CreateUserData, UpdateUserData } from '@/types/user';

// Get all users (paginated)
export async function fetchUsers() {
  const { data } = await api.get<UserResponse>('/user');
  return data;
}

// Get single user by ID
export async function fetchUserById(id: number) {
  const { data } = await api.get<User>(`/user/${id}`);
  return data;
}

// Get current user
export async function fetchCurrentUser() {
  const { data } = await api.get<User>('/user/current');
  return data;
}

// Create new user
export async function createUser(userData: CreateUserData) {
  const { data } = await api.post<User>('/user/create', userData);
  return data;
}

// Update user by ID
export async function updateUser(id: number, userData: UpdateUserData) {
  const { data } = await api.put<User>(`/user/${id}`, userData);
  return data;
}

// Update current user
export async function updateCurrentUser(userData: UpdateUserData) {
  const { data } = await api.put<User>('/user/current', userData);
  return data;
}

// Delete user by ID
export async function deleteUser(id: number) {
  await api.delete(`/user/${id}`);
}