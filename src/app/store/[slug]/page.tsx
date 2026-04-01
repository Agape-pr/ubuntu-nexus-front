"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  MapPin, Star, Package, Heart, Share2, MessageCircle, ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { usePublicStore } from "@/lib/api/hooks/useUsers";
import { CloudImage } from "@/components/ui/CloudImage";
import { useState } from "react";
import { toast } from "sonner";

const StorePage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: store, isLoading, error } = usePublicStore(slug);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      toast.success("Store link copied!");
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <h2 className="text-xl font-medium text-muted-foreground">Loading store…</h2>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Store not found / API error ────────────────────────────
  if (error || !store) {
    const isNetworkError = error && (!("status" in error) || (error as any).status === 0 || (error as any).status === 408);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
            {isNetworkError ? (
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            ) : (
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isNetworkError ? "Connection problem" : "Store not found"}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {isNetworkError
                ? "We couldn't reach the server right now. Please check your connection and try again."
                : "This store doesn't exist or may have moved. Try browsing the marketplace for other sellers."}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {isNetworkError && (
              <Button onClick={() => window.location.reload()} className="rounded-xl gap-2">
                Try again
              </Button>
            )}
            <Link href="/marketplace">
              <Button variant="outline" className="rounded-xl gap-2">
                <ShoppingBag size={15} />
                Browse marketplace
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasProducts = store.products && store.products.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Store Header ──────────────────────────────── */}
      <div className="bg-primary relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald blur-3xl" />
        </div>

        <div className="relative container py-12">
          <div className="flex flex-col md:flex-row md:items-end gap-6">

            {/* Store Avatar / Logo */}
            {store.store_logo ? (
              <div className="h-24 w-24 rounded-2xl border-2 border-primary-foreground/20 flex items-center justify-center overflow-hidden flex-shrink-0 bg-white shadow-lg">
                <CloudImage
                  publicId={store.store_logo as string}
                  alt={store.store_name}
                  width={200}
                  height={200}
                  crop="fill"
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-primary-foreground/10 border-2 border-primary-foreground/20 flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm font-bold text-primary-foreground shadow-lg select-none">
                {store.store_name?.substring(0, 2).toUpperCase() || "??"}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-primary-foreground">{store.store_name}</h1>
                <span className="px-2.5 py-1 rounded-full bg-emerald/20 text-emerald text-xs font-medium border border-emerald/30 mt-1.5">
                  Verified seller
                </span>
              </div>
              <p className="text-primary-foreground/70 max-w-lg mb-3">
                {store.store_description || "Welcome to our store on UbuntuNow!"}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/60">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  Kigali, Rwanda
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="fill-accent text-accent" />
                  4.8 Rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={13} />
                  {store.products?.length || 0} product{store.products?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 gap-2"
              >
                <Heart size={14} />
                Follow
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 gap-2"
                onClick={handleShare}
              >
                <Share2 size={14} />
                {shareCopied ? "Copied!" : "Share"}
              </Button>
              <Button
                size="sm"
                className="gradient-amber text-accent-foreground rounded-xl border-0 gap-2"
              >
                <MessageCircle size={14} />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Section ──────────────────────────── */}
      <div className="container py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Products{" "}
            <span className="text-muted-foreground font-normal text-base">
              ({store.products?.length || 0})
            </span>
          </h2>
        </div>

        {!hasProducts ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
            {/* Logo recap + illustration */}
            <div className="relative">
              <div className="h-28 w-28 rounded-3xl bg-primary/8 flex items-center justify-center mx-auto">
                {store.store_logo ? (
                  <div className="h-20 w-20 rounded-2xl border border-border overflow-hidden bg-muted shadow-sm">
                    <CloudImage
                      publicId={store.store_logo as string}
                      alt={store.store_name}
                      width={80}
                      height={80}
                      crop="fill"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-2xl text-primary select-none">
                    {store.store_name?.substring(0, 2).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="absolute -top-2 -right-2 h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shadow-sm">
                <span className="text-xl">🌱</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {store.store_name} — Coming soon!
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                This seller hasn't added any products yet. Check back soon — great things are coming!
              </p>
            </div>

            <Link href="/marketplace">
              <Button variant="outline" className="rounded-xl gap-2">
                <ShoppingBag size={15} />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          /* ── Product Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {store.products.map((product) => {
              const primaryImage =
                product.images?.find((img) => img.is_primary)?.image ||
                product.images?.[0]?.image;

              return (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  name={product.name}
                  price={Number(product.price)}
                  category={product.category_name}
                  image={primaryImage}
                  storeName={store.store_name}
                  storeSlug={store.slug}
                  inStock={product.stock_quantity > 0}
                />
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StorePage;
