import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  storeName?: string;
  storeSlug?: string;
  slug?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  // Aliases for backwards compatibility
  toggleFavorite: (item: WishlistItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (item) => set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        return exists
          ? { items: state.items.filter((i) => i.id !== item.id) }
          : { items: [...state.items, item] };
      }),
      removeWishlist: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      isWishlisted: (id) => get().items.some((i) => i.id === id),

      // Compatibility aliases
      toggleFavorite: (item) => get().toggleWishlist(item),
      removeFavorite: (id) => get().removeWishlist(id),
      isFavorite: (id) => get().isWishlisted(id),
    }),
    {
      name: 'ubuntunow-wishlist',
    }
  )
);

// Export alias for backwards compatibility
export const useFavoritesStore = useWishlistStore;
export type FavoriteItem = WishlistItem;
