import api from './axios';
import { User, PaginatedResponse, DashboardStats, StreakableItem, UserAction, Connection, TaskRequest, PainLog, AnalyticsData, VerificationRequest } from '@/lib/types';

// Backend wraps responses in { status: 'success', data: ... }
interface BackendResponse<T> {
  status: string;
  data: T;
}

// Helper to unwrap backend response
function unwrap<T>(response: { data: BackendResponse<T> }): T {
  return response.data.data;
}

// Admin API
export const adminApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<BackendResponse<DashboardStats>>('/admin/stats');
    return unwrap(response);
  },

  getUsers: async (params?: {
    limit?: number;
    offset?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> => {
    const response = await api.get<BackendResponse<{ users: User[]; total: number; page: number; limit: number }>>('/admin/users', { params });
    return unwrap(response);
  },

  createAdmin: async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    emergencyContact: string;
    password: string;
    age: number;
  }): Promise<User> => {
    const response = await api.post<BackendResponse<User>>('/admin/admins', data);
    return unwrap(response);
  },

  getVerifications: async (status?: string): Promise<VerificationRequest[]> => {
    const response = await api.get<BackendResponse<VerificationRequest[]>>('/admin/verifications', { params: { status } });
    return unwrap(response);
  },

  verifyUser: async (id: string, status: string, note?: string): Promise<VerificationRequest> => {
    const response = await api.post<BackendResponse<VerificationRequest>>(`/admin/verifications/${id}/verify`, { status, note });
    return unwrap(response);
  },
};

// Users API
export const usersApi = {
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/${id}`);
    return unwrap(response);
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<BackendResponse<User>>(`/users/${id}`, data);
    return unwrap(response);
  },

  listUsers: async (params?: {
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> => {
    const response = await api.get<BackendResponse<User[]>>('/users', { params });
    return unwrap(response);
  },
};

// Streakable Items API
export const streakableApi = {
  getItems: async (): Promise<StreakableItem[]> => {
    const response = await api.get<BackendResponse<StreakableItem[]>>('/streakable-items');
    return unwrap(response);
  },

  createItem: async (data: {
    title: string;
    description?: string;
    frequency_per_day?: number;
    interval_days?: number;
  }): Promise<StreakableItem> => {
    const response = await api.post<BackendResponse<StreakableItem>>('/streakable-items', data);
    return unwrap(response);
  },
};

// Pain Logs API
export const painLogsApi = {
  getLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    warriorId?: string;
    isCrisis?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: PainLog[]; total: number; page: number; limit: number }> => {
    const response = await api.get<BackendResponse<{ logs: PainLog[]; total: number; page: number; limit: number }>>('/admin/pain-logs', { params });
    return unwrap(response);
  },
};

// Connections API
export const connectionsApi = {
  getAll: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ connections: Connection[]; total: number; page: number; limit: number }> => {
    const response = await api.get<BackendResponse<{ connections: Connection[]; total: number; page: number; limit: number }>>('/admin/connections', { params });
    return unwrap(response);
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (params?: {
    status?: string;
    requestType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: TaskRequest[]; total: number; page: number; limit: number }> => {
    const response = await api.get<BackendResponse<{ tasks: TaskRequest[]; total: number; page: number; limit: number }>>('/admin/tasks', { params });
    return unwrap(response);
  },
};

// Activity Logs API (needs backend extension)
export const activityApi = {
  getLogs: async (params?: {
    actionType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<UserAction>> => {
    // This would need a new backend endpoint
    const response = await api.get<BackendResponse<PaginatedResponse<UserAction>>>('/admin/activity', { params });
    return unwrap(response);
  },
};

// Analytics API
export const analyticsApi = {
  getData: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsData> => {
    const response = await api.get<BackendResponse<AnalyticsData>>('/admin/analytics', { params });
    return unwrap(response);
  },
};
