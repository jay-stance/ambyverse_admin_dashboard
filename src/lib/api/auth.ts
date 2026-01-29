import api from './axios';
import { AuthResponse, LoginRequest, User } from '@/lib/types';

// Backend wraps responses in { status: 'success', data: ... }
interface BackendResponse<T> {
  status: string;
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>('/auth/login', data);
    return response.data.data; // Unwrap from { status, data }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<BackendResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<BackendResponse<{ message: string }>>('/auth/reset-password', data);
    return response.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<BackendResponse<{ message: string }>>('/auth/change-password', data);
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post<BackendResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<BackendResponse<User>>('/users/me');
    return response.data.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
};

