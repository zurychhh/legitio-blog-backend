import apiClient from './client';
import type { TaskStatus, HealthCheck, TriggerTaskRequest } from '../types';

export const tasksApi = {
  generatePost: async (data: TriggerTaskRequest): Promise<TaskStatus> => {
    const response = await apiClient.post<TaskStatus>('/tasks/generate-post', data);
    return response.data;
  },

  getStatus: async (taskId: string): Promise<TaskStatus> => {
    const response = await apiClient.get<TaskStatus>(`/tasks/status/${taskId}`);
    return response.data;
  },

  getActive: async (): Promise<{ active: any[]; scheduled: any[]; reserved: any[] }> => {
    const response = await apiClient.get('/tasks/active');
    return response.data;
  },

  cancel: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/cancel/${taskId}`);
  },

  checkHealth: async (): Promise<HealthCheck> => {
    const response = await apiClient.get<HealthCheck>('/tasks/health');
    return response.data;
  },

  monitorRss: async (sourceId: string, autoGenerate: boolean = false): Promise<TaskStatus> => {
    const response = await apiClient.post<TaskStatus>('/tasks/monitor-rss', {
      source_id: sourceId,
      auto_generate: autoGenerate,
    });
    return response.data;
  },

  publishPost: async (postId: string, publisherId?: string): Promise<TaskStatus> => {
    const response = await apiClient.post<TaskStatus>('/tasks/publish-post', {
      post_id: postId,
      publisher_id: publisherId,
    });
    return response.data;
  },

  retryFailed: async (): Promise<{ message: string; triggered_count: number }> => {
    const response = await apiClient.post('/tasks/retry-failed');
    return response.data;
  },
};
