import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  storeName?: string;
  storeSlug?: string;
  slug?: string;
}

interface FavoritesStore {
  items: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (item) => set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        return exists
          ? { items: state.items.filter((i) => i.id !== item.id) }
          : { items: [...state.items, item] };
      }),
      removeFavorite: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      isFavorite: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'ubuntunow-favorites',
    }
  )
);
