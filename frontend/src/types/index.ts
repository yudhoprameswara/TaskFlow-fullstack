// Task types
export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string;
}

// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TaskStats {
  total: number;
  pending: number;
  'in-progress': number;
  done: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  stats?: TaskStats;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
}
