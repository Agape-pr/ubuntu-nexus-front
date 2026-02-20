/**
 * Categories API Service
 * 
 * This file contains API functions for category-related endpoints.
 * Based on Swagger documentation: /api/v1/products/categories/
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

/**
 * Get list of categories
 */
export const getCategories = async (): Promise<Category[]> => {
  return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);
};

/**
 * Get single category by ID
 */
export const getCategory = async (id: number): Promise<Category> => {
  return apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
};

/**
 * Create new category
 */
export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  return apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.CREATE, data);
};

/**
 * Update category - PUT
 */
export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> => {
  return apiClient.put<Category>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
};

/**
 * Partially update category - PATCH
 */
export const patchCategory = async (
  id: number,
  data: Partial<UpdateCategoryRequest>
): Promise<Category> => {
  return apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.PATCH(id), data);
};

/**
 * Delete category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
};
