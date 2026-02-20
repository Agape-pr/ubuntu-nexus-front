/**
 * Products API Service
 * 
 * This file contains API functions for product-related endpoints.
 * Based on Swagger documentation: /api/v1/products/products/, /api/v1/products/seller/products/
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Product Image
export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
}

// Public Product (from /products/products/)
export interface Product {
  id: number;
  store: number;
  store_name: string;
  category: number;
  category_name: string;
  name: string;
  description?: string;
  price: string; // API returns as string
  stock_quantity: number;
  is_active: boolean;
  images: ProductImage[];
  created_at: string;
}

// Seller Product (from /products/seller/products/)
export interface SellerProduct {
  id: number;
  category: number;
  name: string;
  description?: string;
  price: string; // API returns as string
  stock_quantity: number;
  is_active: boolean;
}

// Product List Query Parameters
export interface ProductsListParams {
  category__slug?: string;
  ordering?: string; // e.g., 'price', '-price', 'created_at', '-created_at'
  price__gte?: number;
  price__lte?: number;
  search?: string;
  store__id?: number;
}

// Product Create/Update Request (Seller)
export interface ProductCreateUpdate {
  category: number;
  name: string;
  description?: string;
  price: string | number; // Can be string or number
  stock_quantity: number;
  is_active?: boolean;
  uploaded_images?: string[]; // Array of image URLs
}

/**
 * Get list of products (Public)
 */
export const getProducts = async (params?: ProductsListParams): Promise<Product[]> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const endpoint = queryParams.toString()
    ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`
    : API_ENDPOINTS.PRODUCTS.LIST;
  
  return apiClient.get<Product[]>(endpoint);
};

/**
 * Get single product by slug (Public)
 */
export const getProduct = async (slug: string): Promise<Product> => {
  return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(slug));
};

/**
 * Get seller's products
 */
export const getSellerProducts = async (): Promise<SellerProduct[]> => {
  return apiClient.get<SellerProduct[]>(API_ENDPOINTS.SELLER_PRODUCTS.LIST);
};

/**
 * Get single seller product by ID
 */
export const getSellerProduct = async (id: string): Promise<SellerProduct> => {
  return apiClient.get<SellerProduct>(API_ENDPOINTS.SELLER_PRODUCTS.DETAIL(id));
};

/**
 * Create new product (Seller)
 */
export const createProduct = async (data: ProductCreateUpdate): Promise<SellerProduct> => {
  // Ensure price is string as API expects
  const payload = {
    ...data,
    price: String(data.price),
  };
  
  return apiClient.post<SellerProduct>(API_ENDPOINTS.SELLER_PRODUCTS.CREATE, payload);
};

/**
 * Update product (Seller) - PUT
 */
export const updateProduct = async (
  id: string,
  data: ProductCreateUpdate
): Promise<SellerProduct> => {
  // Ensure price is string as API expects
  const payload = {
    ...data,
    price: String(data.price),
  };
  
  return apiClient.put<SellerProduct>(API_ENDPOINTS.SELLER_PRODUCTS.UPDATE(id), payload);
};

/**
 * Partially update product (Seller) - PATCH
 */
export const patchProduct = async (
  id: string,
  data: Partial<ProductCreateUpdate>
): Promise<SellerProduct> => {
  // Ensure price is string if provided
  const payload = data.price !== undefined
    ? { ...data, price: String(data.price) }
    : data;
  
  return apiClient.patch<SellerProduct>(API_ENDPOINTS.SELLER_PRODUCTS.PATCH(id), payload);
};

/**
 * Delete product (Seller)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.SELLER_PRODUCTS.DELETE(id));
};
