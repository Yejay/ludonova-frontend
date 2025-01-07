import { api } from './client';
import type { User, CreateUserData, UpdateUserData } from '@/types/user';

// Get current user
export async function fetchCurrentUser(): Promise<User> {
  try {
    const { data } = await api.get<User>('/user/current');
    return data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}

// Update current user
export async function updateCurrentUser(userData: UpdateUserData) {
  try {
    const { data } = await api.put<User>('/user/current', userData);
    return data;
  } catch (error) {
    console.error('Error updating current user:', error);
    throw error;
  }
}

// Admin endpoints below
export async function fetchUsers() {
  const { data } = await api.get<User[]>('/user');
  return data;
}

export async function fetchUserById(id: number) {
  const { data } = await api.get<User>(`/user/${id}`);
  return data;
}

export async function createUser(userData: CreateUserData) {
  const { data } = await api.post<User>('/user/create', userData);
  return data;
}

export async function updateUser(id: number, userData: UpdateUserData) {
  const { data } = await api.put<User>(`/user/${id}`, userData);
  return data;
}

export async function deleteUser(id: number) {
  await api.delete(`/user/${id}`);
}