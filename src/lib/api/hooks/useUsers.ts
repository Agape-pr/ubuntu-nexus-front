import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCurrentUser, UserProfile, getPublicStore, PublicStoreData, updateStore, UpdateStoreRequest, UserStore } from '../services/users';

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

/**
 * Hook to update the seller's store profile
 */
export const useUpdateStore = () => {
    const queryClient = useQueryClient();

    return useMutation<UserStore, Error, UpdateStoreRequest>({
        mutationFn: updateStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            toast.success("Store settings updated successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update store settings.");
        }
    });
};
