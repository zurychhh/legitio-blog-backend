import apiClient from './client';
import type { Source, CreateSourceRequest } from '../types';

export const sourcesApi = {
  getAll: async (): Promise<Source[]> => {
    const response = await apiClient.get<Source[]>('/sources');
    return response.data;
  },

  getById: async (id: string): Promise<Source> => {
    const response = await apiClient.get<Source>(`/sources/${id}`);
    return response.data;
  },

  create: async (data: CreateSourceRequest): Promise<Source> => {
    const response = await apiClient.post<Source>('/sources', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSourceRequest>): Promise<Source> => {
    const response = await apiClient.put<Source>(`/sources/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sources/${id}`);
  },

  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/sources/${id}/test`);
    return response.data;
  },
};
