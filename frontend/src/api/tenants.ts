import apiClient from './client';
import type { Tenant } from '../types';

export const tenantsApi = {
  getCurrent: async (): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>('/tenants/me');
    return response.data;
  },

  update: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },
};
