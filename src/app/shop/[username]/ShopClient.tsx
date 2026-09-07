"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import ProductCard, { ProductGrid } from "@/components/ProductCard";
import { CloudImage } from "@/components/ui/CloudImage";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Share2, ShoppingBag, PackageSearch, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";

import { useProducts } from "@/lib/api/hooks/useProducts";
import { makeStoreSlug, extractNumericStoreId } from "@/lib/utils";

interface ShopClientProps {
  store: {
    store_name?: string;
    store_description?: string | null;
    store_logo?: string | null;
  };
  initialProducts: any[];
  username: string;
}

function ShopContent({ store, initialProducts, username }: ShopClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, userRole } = useAuthState();
  const useShell = isLoggedIn && userRole !== "seller";
  const { data: clientProducts = [] } = useProducts();

  const numId = extractNumericStoreId(username);
  const normUser = username.toLowerCase().trim();

  // Combine initial SSR products with live client products for maximum resilience
  const rawList = initialProducts.length > 0 ? initialProducts : clientProducts;
  const storeProducts = rawList.filter((p: any) => {
    const pStoreId = typeof p.store === "object" ? p.store?.id : (p.store ?? p.store_id);
    const pStoreName = p.store_name || p.store?.store_name || "";
    const pStoreSlug = p.store?.slug || p.store_slug || (pStoreName ? makeStoreSlug(pStoreName) : "");

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

  const resolvedStoreName =
    store?.store_name ||
    (storeProducts[0]?.store_name || (typeof storeProducts[0]?.store === "object" ? storeProducts[0]?.store?.store_name : null)) ||
    (numId ? `Store #${numId}` : username.replace(/-/g, " "));

  const storeInitials = resolvedStoreName.slice(0, 2).toUpperCase();

  const products = storeProducts.filter((p: any) =>
    (p.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: resolvedStoreName, text: `Check out ${resolvedStoreName} on UbuntuNow`, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Store link copied to clipboard");
    }
  };

  const content = (
    <>
      {/* Cover */}
      <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-secondary via-secondary/60 to-background">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground text-xs font-semibold backdrop-blur-md border border-border/80 shadow-sm active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Identity */}
          <div className="relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl border-4 border-background shadow-md shrink-0 overflow-hidden bg-secondary flex items-center justify-center">
              <CloudImage
                publicId={store?.store_logo || ""}
                alt={resolvedStoreName}
                width={128}
                height={128}
                crop="fill"
                className="w-full h-full object-cover"
                fallback={<span className="text-2xl font-bold text-muted-foreground">{storeInitials}</span>}
              />
            </div>

            <div className="flex-1 pb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight capitalize">
                  {resolvedStoreName}
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs font-medium">
                  <MapPin size={13} /> Kigali, Rwanda
                  <span className="text-border">·</span>
                  {storeProducts.length} product{storeProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Button variant="outline" size="sm" className="gap-2 rounded-lg self-start sm:self-auto font-semibold" onClick={handleShare}>
                <Share2 size={14} /> Share Store
              </Button>
            </div>
          </div>

          {/* Description */}
          {store?.store_description && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mb-8 pb-8 border-b border-border/60">
              {store.store_description}
            </p>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-foreground">Store Inventory</h2>
            <div className="relative sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search products in store…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="pb-16">
            {storeProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-card rounded-xl border border-border/80 shadow-2xs">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-3 text-muted-foreground">
                  <ShoppingBag size={22} />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">No Products Listed</h3>
                <p className="text-muted-foreground text-xs max-w-xs">
                  {resolvedStoreName} hasn&apos;t listed any items for sale yet.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-card rounded-xl border border-border/80 shadow-2xs">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-3 text-muted-foreground">
                  <PackageSearch size={22} />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">No Search Results</h3>
                <p className="text-muted-foreground text-xs max-w-xs">
                  No items found matching &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            ) : (
              <ProductGrid
                products={products.map((product) => ({
                  id: String(product.id),
                  slug: product.slug || String(product.id),
                  name: product.name,
                  price: Number(product.price),
                  image: product.image || product.images?.[0]?.image,
                  storeName: resolvedStoreName,
                  storeSlug: username,
                  category: typeof product.category === "object" ? product.category?.name : product.category,
                  inStock: Number(product.stock_quantity) > 0,
                  stockQuantity: Number(product.stock_quantity),
                  sellerHasStock: product.in_stock,
                }))}
              />
            )}
          </div>
        </div>
    </>
  );

  if (useShell) {
    return <BuyerDashboardShell>{content}</BuyerDashboardShell>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{content}</main>
    </div>
  );
}

export default function ShopClient(props: ShopClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopContent {...props} />
    </Suspense>
  );
}
