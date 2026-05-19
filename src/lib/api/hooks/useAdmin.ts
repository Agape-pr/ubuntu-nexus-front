import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, getAdminUserDetail, createAdminUser, AdminUserFilters, AdminUsersResponse, AdminUser, AdminUserCreatePayload } from '../services/admin';

export const useAdminUsers = (filters: AdminUserFilters = {}) => {
  return useQuery<AdminUsersResponse, Error>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => getAdminUsers(filters),
    staleTime: 30_000,
  });
};

export const useAdminUserDetail = (id: number | null) => {
  return useQuery<AdminUser, Error>({
    queryKey: ['admin', 'user', id],
    queryFn: () => getAdminUserDetail(id as number),
    enabled: !!id,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, Error, AdminUserCreatePayload>({
    mutationFn: (data) => createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};
