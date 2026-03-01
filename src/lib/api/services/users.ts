import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Product } from './products';

export interface UserStore {
    store_name: string;
    slug?: string;
    store_description?: string | null;
    store_logo?: string | null;
}

export interface UserProfile {
    id: number;
    email: string;
    role: string;
    phone_number?: string | null;
    store?: UserStore | null;
}

export interface PublicStoreData {
    store_name: string;
    slug: string;
    store_description?: string | null;
    store_logo?: string | null;
    created_at?: string;
    products: Product[];
}

/**
 * Get current authenticated user's profile
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(API_ENDPOINTS.USERS.ME);
};

/**
 * Get a public store's profile and products by slug
 */
export const getPublicStore = async (slug: string): Promise<PublicStoreData> => {
    return apiClient.get<PublicStoreData>(API_ENDPOINTS.USERS.STORE_PUBLIC(slug));
};
