/**
 * Categories Hooks
 * 
 * React Query hooks for category operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as categoryService from '../services/categories';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../services/categories';

/**
 * Hook to get list of categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
  });
};

/**
 * Hook to get single category by ID
 */
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to create category. Please try again.');
    },
  });
};

/**
 * Hook to update a category - PUT
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
      toast.success('Category updated successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to update category. Please try again.');
    },
  });
};

/**
 * Hook to partially update a category - PATCH
 */
export const usePatchCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UpdateCategoryRequest> }) =>
      categoryService.patchCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
      toast.success('Category updated successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to update category. Please try again.');
    },
  });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete category. Please try again.');
    },
  });
};
