import api from './axios';
import type { ApiResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

interface AuthData {
  token: string;
  user: User;
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthData>> {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', credentials);
    return data;
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthData>> {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', credentials);
    return data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
