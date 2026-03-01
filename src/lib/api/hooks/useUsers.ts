import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, UserProfile, getPublicStore, PublicStoreData } from '../services/users';

/**
 * Hook to fetch the current authenticated user's profile
 */
export const useCurrentUser = () => {
    return useQuery<UserProfile, Error>({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        retry: false, // Don't retry auth errors constantly
    });
};

/**
 * Hook to fetch a public store profile and its products
 */
export const usePublicStore = (slug?: string) => {
    return useQuery<PublicStoreData, Error>({
        queryKey: ['store', slug],
        queryFn: () => getPublicStore(slug as string),
        enabled: !!slug,
    });
};
