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
async function getStoreProducts(username: string) {
  try {
    // Assuming backend supports filtering products by store slug: ?store=username
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}?store=${username}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.results || data || [];
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
    title: `${store.name || store.slug} | UbuntuNow`,
    description: store.description || `Welcome to ${store.name || store.slug}'s official storefront on UbuntuNow.`,
    openGraph: {
      title: store.name || store.slug,
      description: store.description,
      images: [store.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${store.slug}`],
    },
  };
}

export default async function ShopPage({ params }: { params: { username: string } }) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.username);

  if (!store) {
    notFound();
  }

  const products = await getStoreProducts(resolvedParams.username);

  return (
    <ShopClient store={store} initialProducts={products} username={resolvedParams.username} />
  );
}
