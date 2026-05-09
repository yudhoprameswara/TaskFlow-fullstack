import api from './axios';
import type { PaginatedResponse, ApiResponse, Task, TaskFormData } from '@/types';

export interface GetTasksParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const taskService = {
  async getTasks(params: GetTasksParams = {}): Promise<PaginatedResponse<Task>> {
    const { data } = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return data;
  },

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data;
  },

  async createTask(payload: TaskFormData): Promise<ApiResponse<Task>> {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', payload);
    return data;
  },

  async updateTask(id: string, payload: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data;
  },

  async deleteTask(id: string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/tasks/${id}`);
    return data;
  },
};
