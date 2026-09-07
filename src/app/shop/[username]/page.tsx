import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopClient from './ShopClient';

import { makeStoreSlug } from '@/lib/utils';
// Use the API config from the project
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api/config';

// Helper to extract numeric store ID from username slug (e.g. "store-16" -> 16, "16" -> 16)
function extractNumericStoreId(username: string): number | null {
  const clean = username.trim().toLowerCase();
  if (/^\d+$/.test(clean)) return parseInt(clean, 10);
  const match = clean.match(/^store-(\d+)$/);
  if (match) return parseInt(match[1], 10);
  return null;
}

// Fetch with short 3s timeout to prevent Server Component UND_ERR_CONNECT_TIMEOUT
async function fetchWithTimeout(url: string, timeoutMs: number = 3000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// 1. Fetch Store Data
async function getStore(username: string) {
  const numId = extractNumericStoreId(username);

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.USERS.STORE_PUBLIC(username)}`, 3000);
    if (res && res.ok) {
      const data = await res.json();
      if (data && (data.store_name || data.id)) return data;
    }
    
    // Fallback: fetch products list to resolve store details
    const prodRes = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`, 3000);
    if (prodRes && prodRes.ok) {
      const prodData = await prodRes.json();
      const allProds = prodData.results || prodData || [];
      const norm = username.toLowerCase().trim();

      const match = allProds.find((p: any) => {
        const pStoreId = typeof p.store === 'object' ? p.store?.id : (p.store ?? p.store_id);
        if (numId !== null && pStoreId !== null && Number(pStoreId) === Number(numId)) {
          return true;
        }
        const sName = p.store_name || p.store?.store_name || '';
        const sSlug = p.store?.slug || p.store_slug || (sName ? makeStoreSlug(sName) : '');
        return sSlug === norm || norm.includes(sSlug) || sSlug.includes(norm);
      });

      if (match) {
        const realStoreId = typeof match.store === 'object' ? match.store?.id : (match.store ?? match.store_id ?? numId);
        const realStoreName = match.store_name || match.store?.store_name || (realStoreId ? `Store #${realStoreId}` : username.replace(/-/g, ' '));
        return {
          id: realStoreId,
          store_name: realStoreName,
          slug: username,
          store_description: 'Welcome to our store on UbuntuNow',
          store_logo: match.store?.store_logo || null,
        };
      }
    }

    return {
      id: numId,
      store_name: numId ? `Store #${numId}` : username.replace(/-/g, ' '),
      slug: username,
      store_description: 'Welcome to our store on UbuntuNow',
      store_logo: null,
    };
  } catch {
    return {
      id: numId,
      store_name: numId ? `Store #${numId}` : username.replace(/-/g, ' '),
      slug: username,
      store_description: 'Welcome to our store on UbuntuNow',
      store_logo: null,
    };
  }
}

// 2. Fetch Store Products
async function getStoreProducts(storeId: number | null, username: string) {
  try {
    const numId = storeId || extractNumericStoreId(username);
    let allProducts: any[] = [];

    if (numId) {
      const res = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}?store=${numId}&store_id=${numId}`, 3000);
      if (res && res.ok) {
        const data = await res.json();
        const results = data.results || data || [];
        if (Array.isArray(results) && results.length > 0) {
          allProducts = results;
        }
      }
    }

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      const res = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`, 3000);
      if (res && res.ok) {
        const data = await res.json();
        allProducts = data.results || data || [];
      }
    }
    
    if (!Array.isArray(allProducts)) return [];
    
    const normUser = username.toLowerCase().trim();

    const filtered = allProducts.filter((p: any) => {
      const pStoreId = typeof p.store === 'object' ? p.store?.id : (p.store ?? p.store_id);
      const pStoreName = p.store_name || p.store?.store_name || '';
      const pStoreSlug = p.store?.slug || p.store_slug || (pStoreName ? makeStoreSlug(pStoreName) : '');

      if (numId !== null && pStoreId !== null && Number(pStoreId) === Number(numId)) {
        return true;
      }
      if (normUser && pStoreSlug && (pStoreSlug === normUser || normUser.includes(pStoreSlug) || pStoreSlug.includes(normUser))) {
        return true;
      }
      if (normUser && pStoreName) {
        const normName = makeStoreSlug(pStoreName);
        if (normName === normUser || normUser.includes(normName) || normName.includes(normUser)) return true;
      }
      return false;
    });

    if (filtered.length > 0) {
      return filtered;
    }

    if (numId !== null) {
      const idMatch = allProducts.filter((p: any) => {
        const pStoreId = typeof p.store === 'object' ? p.store?.id : (p.store ?? p.store_id);
        return pStoreId && Number(pStoreId) === Number(numId);
      });
      if (idMatch.length > 0) return idMatch;
    }

    return [];
  } catch {
    return [];
  }
}

// 3. Dynamic Metadata
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.username);

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
  const products = await getStoreProducts(store?.id, resolvedParams.username);

  return (
    <ShopClient store={store} initialProducts={products} username={resolvedParams.username} />
  );
}
