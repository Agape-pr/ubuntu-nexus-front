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
  is_superuser: boolean;
  admin_permissions: string[];
  date_joined: string;
  last_login?: string | null;
  store?: AdminStore | null;
}

export interface AdminUserCreatePayload {
  email: string;
  password?: string;
  role: 'admin' | 'seller' | 'buyer';
  phone_number?: string;
  admin_permissions?: string[];
}

export type AdminUsersResponse = AdminUser[]; // Backend currently returns a raw unpaginated list

export interface AdminUserFilters {
  role?: 'admin' | 'seller' | 'buyer' | '';
  search?: string;
  page?: number;
}

export const getAdminUsers = async (filters: AdminUserFilters = {}): Promise<AdminUser[]> => {
  const params = new URLSearchParams();
  if (filters.role) params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));

  const query = params.toString();
  const url = `${API_ENDPOINTS.ADMIN.USERS}${query ? `?${query}` : ''}`;
  // Handle both paginated responses (if backend adds pagination later) and raw arrays
  const res = await apiClient.get<any>(url);
  return Array.isArray(res) ? res : (res.results || []);
};

export const getAdminUserDetail = async (id: number): Promise<AdminUser> => {
  return apiClient.get<AdminUser>(API_ENDPOINTS.ADMIN.USER_DETAIL(id));
};

export const createAdminUser = async (data: AdminUserCreatePayload): Promise<AdminUser> => {
  return apiClient.post<AdminUser>(API_ENDPOINTS.ADMIN.USERS, data);
};
