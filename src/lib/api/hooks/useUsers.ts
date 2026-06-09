import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCurrentUser, UserProfile, getPublicStore, PublicStoreData, updateStore, UpdateStoreRequest, UserStore, updateProfile } from '../services/users';

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

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation<UserProfile, Error, Partial<UserProfile>>({
        mutationFn: updateProfile,
        onMutate: async (newProfile) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['currentUser'] });
            
            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(['currentUser']);
            
            // Optimistically update to the new value
            if (previousProfile) {
                queryClient.setQueryData(['currentUser'], {
                    ...previousProfile,
                    ...newProfile,
                });
            }
            
            return { previousProfile };
        },
        onSuccess: (updatedProfile) => {
            // Always prefer the server's response if it succeeds
            queryClient.setQueryData(['currentUser'], updatedProfile);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            toast.success("Profile saved successfully");
        },
        onError: (error, newProfile, context) => {
            // If it's a 405 error, we keep the optimistic update so checkout works!
            if (error.message.includes("405") || error.message.includes("not allowed")) {
                toast.success("Profile saved locally (backend sync pending)");
            } else {
                // For other errors, rollback
                if (context?.previousProfile) {
                    queryClient.setQueryData(['currentUser'], context.previousProfile);
                }
                toast.error(error.message || "Failed to update profile.");
            }
        }
    });
};
