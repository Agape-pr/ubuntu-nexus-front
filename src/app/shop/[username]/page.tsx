import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopClient from './ShopClient';

// Use the API config from the project
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api/config';

// 1. Fetch Store Data
async function getStore(username: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.STORE_PUBLIC(username)}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch store');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 2. Fetch Store Products
// TEMP WORKAROUND: The backend API currently returns all products and ignores store filters.
// It also does not return the store ID in the store profile, and products lack a store slug.
// We must hardcode the mapping and manually filter on the frontend for the demo.
const STORE_SLUG_TO_ID_MAP: Record<string, number> = {
  'ladine-beauty-1': 11, // Mapped from backend database ID for Ladine Beauty
};

async function getStoreProducts(username: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const allProducts = data.results || data || [];

    // Filter products manually based on the mapped store_id
    const storeId = STORE_SLUG_TO_ID_MAP[username];
    if (storeId) {
      return allProducts.filter((p: any) => p.store_id === storeId);
    }

    // Return empty if we don't know the store ID mapping to prevent showing all products
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 3. Dynamic Metadata
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.username);

  if (!store) {
    return {
      title: 'Store Not Found | UbuntuNow',
    };
  }

  return {
    title: `${store.store_name || store.slug} | UbuntuNow`,
    description: store.store_description || `Welcome to ${store.store_name || store.slug}'s official storefront on UbuntuNow.`,
    openGraph: {
      title: store.store_name || store.slug,
      description: store.store_description || `Shop ${store.store_name || store.slug}'s collection on UbuntuNow.`,
      images: [store.store_logo || '/default-og.png'],
    },
  };
}

export default async function ShopPage({ params }: { params: { username: string } }) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.username);

  if (!store) {
    notFound();
  }

  // Fetch products by the string slug since the backend doesn't provide store.id
  const products = await getStoreProducts(resolvedParams.username);

  return (
    <ShopClient store={store} initialProducts={products} username={resolvedParams.username} />
  );
}
