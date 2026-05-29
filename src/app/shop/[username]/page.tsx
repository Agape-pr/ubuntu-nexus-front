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
async function getStoreProducts(storeId: number, username: string) {
  try {
    // We now have store.id from the updated backend!
    // But if Railway is still deploying, storeId might be undefined.
    // We'll fallback to a hardcoded mapping just in case during the transition.
    const fallbackId = username === 'ladine-beauty-1' ? 11 : null;
    const finalStoreId = storeId || fallbackId;

    if (!finalStoreId) return [];

    // The backend uses django-filter which expects `store_id=`
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}?store_id=${finalStoreId}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const allProducts = data.results || data || [];
    
    // In case the backend filter fails, we also filter client-side just to be absolutely safe
    return allProducts.filter((p: any) => p.store_id === finalStoreId);
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

  // Fetch products by the store.id (which was added to the backend!)
  const products = await getStoreProducts(store.id, resolvedParams.username);

  return (
    <ShopClient store={store} initialProducts={products} username={resolvedParams.username} />
  );
}
