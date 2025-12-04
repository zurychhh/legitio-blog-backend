import apiClient from './client';
import type { Publisher, CreatePublisherRequest } from '../types';

export const publishersApi = {
  getAll: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<Publisher[]>('/publishers');
    return response.data;
  },

  getById: async (id: string): Promise<Publisher> => {
    const response = await apiClient.get<Publisher>(`/publishers/${id}`);
    return response.data;
  },

  create: async (data: CreatePublisherRequest): Promise<Publisher> => {
    const response = await apiClient.post<Publisher>('/publishers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePublisherRequest>): Promise<Publisher> => {
    const response = await apiClient.put<Publisher>(`/publishers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/publishers/${id}`);
  },

  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/publishers/${id}/test`);
    return response.data;
  },
};
