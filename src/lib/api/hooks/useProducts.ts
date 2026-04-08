/**
 * Products Hooks
 * 
 * React Query hooks for product operations
 * Updated to match Swagger API documentation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as productService from '../services/products';
import type {
  ProductsListParams,
  ProductCreateUpdate,
} from '../services/products';

/**
 * Hook to get list of products (Public)
 */
export const useProducts = (params?: ProductsListParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get single product by slug
 */
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => productService.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to create category.');
    },
  });
};

/**
 * Hook to get seller's products
 */
export const useSellerProducts = () => {
  return useQuery({
    queryKey: ['seller-products'],
    queryFn: () => productService.getSellerProducts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get single seller product by ID
 */
export const useSellerProduct = (id: string) => {
  return useQuery({
    queryKey: ['seller-product', id],
    queryFn: () => productService.getSellerProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a product (Seller)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateUpdate) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to create product. Please try again.');
    },
  });
};

/**
 * Hook to update a product (Seller) - PUT
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductCreateUpdate }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product', variables.id] });
      toast.success('Product updated successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to update product. Please try again.');
    },
  });
};

/**
 * Hook to partially update a product (Seller) - PATCH
 */
export const usePatchProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductCreateUpdate> }) =>
      productService.patchProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-product', variables.id] });
      toast.success('Product updated successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to update product. Please try again.');
    },
  });
};

/**
 * Hook to delete a product (Seller)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete product. Please try again.');
    },
  });
};
