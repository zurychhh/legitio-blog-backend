import apiClient from './client';
import type { Agent, CreateAgentRequest } from '../types';

export const agentsApi = {
  getAll: async (): Promise<Agent[]> => {
    const response = await apiClient.get<Agent[]>('/agents');
    return response.data;
  },

  getById: async (id: string): Promise<Agent> => {
    const response = await apiClient.get<Agent>(`/agents/${id}`);
    return response.data;
  },

  create: async (data: CreateAgentRequest): Promise<Agent> => {
    const response = await apiClient.post<Agent>('/agents', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAgentRequest>): Promise<Agent> => {
    const response = await apiClient.put<Agent>(`/agents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/agents/${id}`);
  },
};
