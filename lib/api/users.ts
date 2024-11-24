import { api } from './client';
import type { UserResponse } from '@/types/user';

export async function fetchUsers() {
  const { data } = await api.get<UserResponse>('/user');
  return data;
}

export async function deleteUser(id: number) {
  await api.delete(`/user/${id}`);
}