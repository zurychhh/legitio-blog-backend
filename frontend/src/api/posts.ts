import apiClient from './client';
import type { Post } from '../types';

export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await apiClient.get<{items: Post[]}>('/posts');
    return response.data.items;
  },

  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Post>): Promise<Post> => {
    const response = await apiClient.put<Post>(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  schedule: async (id: string, scheduledAt: string, publisherId?: string): Promise<Post> => {
    const response = await apiClient.post<Post>(`/posts/${id}/schedule`, {
      scheduled_at: scheduledAt,
      publisher_id: publisherId,
    });
    return response.data;
  },
};
