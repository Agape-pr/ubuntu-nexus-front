"use client";

import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import ProductCard, { ProductGrid } from "@/components/ProductCard";
import { CloudImage } from "@/components/ui/CloudImage";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Share2, ShoppingBag, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, userRole } = useAuthState();
  const useShell = isLoggedIn && userRole !== "seller";

  const storeName = store?.store_name || username.replace(/-/g, " ");
  const storeInitials = storeName.slice(0, 2).toUpperCase();

  const products = initialProducts.filter((p) =>
    (p.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: storeName, text: `Check out ${storeName} on UbuntuNow`, url });
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Identity */}
          <div className="relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-background shadow-lg shrink-0 overflow-hidden bg-secondary flex items-center justify-center">
              <CloudImage
                publicId={store?.store_logo || ""}
                alt={storeName}
                width={128}
                height={128}
                crop="fill"
                className="w-full h-full object-cover"
                fallback={<span className="text-2xl font-black text-muted-foreground">{storeInitials}</span>}
              />
            </div>

            <div className="flex-1 pb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight capitalize">
                  {storeName}
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                  <MapPin size={13} /> Kigali, Rwanda
                  <span className="text-border">·</span>
                  {initialProducts.length} product{initialProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Button variant="outline" className="gap-2 rounded-xl self-start sm:self-auto" onClick={handleShare}>
                <Share2 size={15} /> Share store
              </Button>
            </div>
          </div>

          {/* Description */}
          {store?.store_description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl mb-8 pb-8 border-b border-border/60">
              {store.store_description}
            </p>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-foreground">Products</h2>
            <div className="relative sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search this store…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-card border border-border rounded-xl pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground placeholder:text-muted-foreground transition-shadow"
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="pb-16">
            {initialProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                  <ShoppingBag size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1.5">No products yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {storeName} hasn&apos;t listed any products yet — check back soon.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                  <PackageSearch size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1.5">No matches</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Nothing in this store matches &ldquo;{searchQuery}&rdquo;.
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
                  storeName,
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
