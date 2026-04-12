import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface AdminStore {
  id: number;
  store_name: string;
  slug: string;
  store_description?: string | null;
  store_logo?: string | null;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'buyer';
  phone_number?: string | null;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string | null;
  store?: AdminStore | null;
}

export interface AdminUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AdminUserFilters {
  role?: 'admin' | 'seller' | 'buyer' | '';
  search?: string;
  page?: number;
}

export const getAdminUsers = async (filters: AdminUserFilters = {}): Promise<AdminUsersResponse> => {
  const params = new URLSearchParams();
  if (filters.role) params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));

  const query = params.toString();
  const url = `${API_ENDPOINTS.ADMIN.USERS}${query ? `?${query}` : ''}`;
  return apiClient.get<AdminUsersResponse>(url);
};

export const getAdminUserDetail = async (id: number): Promise<AdminUser> => {
  return apiClient.get<AdminUser>(API_ENDPOINTS.ADMIN.USER_DETAIL(id));
};
