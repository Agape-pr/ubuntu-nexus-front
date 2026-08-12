"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import { useProduct, useProducts } from "@/lib/api/hooks/useProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthState } from "@/hooks/useAuthState";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { CloudImage } from "@/components/ui/CloudImage";
import { toast } from "sonner";
import {
  ArrowLeft, Heart, Store, Truck, MapPin, Clock, Share2, Plus, Minus,
  CheckCircle, XCircle, Mail, PackageSearch, ChevronLeft, ChevronRight, Lock,
} from "lucide-react";

// SEED DATA FALLBACK
const SEED_PRODUCTS = [
  { id: "seed-1", name: "Ankara Print Tote Bag", price: 12500, category: "Bags & Leather", image: "/products/ankara-bag.png", storeName: "Kigali Crafts", storeSlug: "kigali-crafts", inStock: true, description: "A beautifully handcrafted Ankara print tote bag perfect for everyday use. Made with durable local fabric and genuine leather straps. Features an interior zipper pocket and magnetic snap closure." },
  { id: "seed-2", name: "Handmade Beaded Necklace Set", price: 8500, category: "Jewelry & Accessories", image: "/products/beaded-necklace.png", storeName: "Umucyo Jewels", storeSlug: "umucyo-jewels", inStock: true, description: "Traditional Rwandan beaded necklace set with matching earrings. Intricately woven patterns reflecting the local heritage. Lightweight and perfect for special occasions." },
  { id: "seed-3", name: "Organic Shea Butter Cream", price: 5500, category: "Beauty & Skincare", image: "/products/shea-butter.png", storeName: "Uruto Organics", storeSlug: "uruto-organics", inStock: true, description: "100% pure unrefined shea butter whipped with soothing essential oils. Sourced directly from local women's cooperatives. Deeply moisturizing and great for sensitive skin." },
  { id: "seed-4", name: "Rwanda Single-Origin Coffee", price: 7000, category: "Food & Spices", image: "/products/coffee.png", storeName: "Akagera Roasters", storeSlug: "akagera-roasters", inStock: true, description: "Premium Bourbon arabica whole beans from the volcanic slopes of Northern Rwanda. Features tasting notes of black tea, orange blossom, and a hint of dark chocolate." },
  { id: "seed-5", name: "Traditional Peace Basket", price: 15000, category: "Handmade Crafts", image: "/products/basket.png", storeName: "Inzozi Baskets", storeSlug: "inzozi-baskets", inStock: true, description: "Also known as an Agaseke, this iconic Rwandan peace basket is tightly handwoven from sisal and sweetgrass. A beautiful symbol of unity and hope for your living room." },
  { id: "seed-6", name: "Hand-Carved Wood Sculpture", price: 22000, category: "Art & Paintings", image: "/products/wood-carving.png", storeName: "Ubumuntu Arts", storeSlug: "ubumuntu-arts", inStock: true, description: "Solid mahogany wood carving depicting traditional Rwandan life. Hand-sanded and polished with natural beeswax. A stunning centerpiece standing at 12 inches tall." },
];

const makeStoreSlug = (name?: string) =>
  name ? name.toLowerCase().trim().replace(/\s+/g, "-") : "";

function GallerySkeleton() {
  return (
    <div className="lg:col-span-5 flex flex-col gap-3">
      <div className="rounded-2xl aspect-square bg-secondary animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-16 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ProductChrome({ useShell, children }: { useShell: boolean; children: React.ReactNode }) {
  if (useShell) {
    return <BuyerDashboardShell>{children}</BuyerDashboardShell>;
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function ProductPageContent() {
  const params = useParams();
  const router = useRouter();
  const idStr = String(params.id || "");
  const isSeed = idStr.startsWith("seed-");

  const { data: apiProduct, isLoading: isApiLoading } = useProduct(isSeed ? "" : idStr);
  const { data: allProducts = [] } = useProducts();
  const addItem = useCartStore((state) => state.addItem);
  const { isLoggedIn, userRole } = useAuthState();
  const useShell = isLoggedIn && userRole !== "seller";
  const { trackRef: relatedTrackRef, scrollByCard: scrollRelated } = useHorizontalScroll();

  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveImage(0);
  }, [idStr]);

  // Determine Product Data
  let product: any = null;
  let isLoading = false;

  if (isSeed) {
    product = SEED_PRODUCTS.find((p) => p.id === idStr);
    if (product) {
      product = {
        ...product,
        images: [{ image: product.image }],
        stock_quantity: 10,
        store: { store_name: product.storeName, slug: product.storeSlug },
      };
    }
  } else {
    isLoading = isApiLoading;
    product = apiProduct;
  }

  const relatedProducts = useMemo(() => {
    if (!product || isSeed) return [];
    return allProducts
      .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
      .slice(0, 6);
  }, [allProducts, product, isSeed]);

  if (!mounted) return null;

  // Handle Loading State
  if (isLoading) {
    return (
      <ProductChrome useShell={useShell}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            <GallerySkeleton />
            <div className="lg:col-span-7 space-y-4">
              <div className="h-4 bg-secondary w-1/4 rounded animate-pulse" />
              <div className="h-9 bg-secondary w-3/4 rounded animate-pulse" />
              <div className="h-8 bg-secondary w-1/3 rounded animate-pulse" />
              <div className="h-14 bg-secondary w-full rounded-2xl animate-pulse mt-6" />
              <div className="space-y-2 pt-6">
                <div className="h-3 bg-secondary w-full rounded animate-pulse" />
                <div className="h-3 bg-secondary w-full rounded animate-pulse" />
                <div className="h-3 bg-secondary w-2/3 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </ProductChrome>
    );
  }

  // Handle Not Found
  if (!product && !isLoading) {
    return (
      <ProductChrome useShell={useShell}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center flex-col py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
            <PackageSearch size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            This item no longer exists or might have been removed by the seller.
          </p>
          <Button onClick={() => router.push("/")}>Browse marketplace</Button>
        </div>
      </ProductChrome>
    );
  }

  // Product Data Extraction
  const name = product.name;
  const price = Number(product.price);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const stock = Number(product.stock_quantity);
  const inStock = stock > 0;
  const description = product.description || "No description provided.";
  const catName = product.category;
  const sellerHasStock: boolean | undefined = product.in_stock;

  // The list endpoint (used for relatedProducts) reliably returns store_name;
  // fall back to it if this product's own detail response omits the field.
  const listMatch = !isSeed
    ? allProducts.find((p) => String(p.id) === String(product.id) || p.slug === idStr)
    : undefined;
  const storeName =
    product.store?.store_name || product.store_name || listMatch?.store_name || "Unknown Store";
  // The API never returns a store slug — every other page derives it from the
  // store name the same way, so /shop/[slug] links resolve correctly.
  const storeSlug = product.store?.slug || product.storeSlug || makeStoreSlug(storeName);

  const images: string[] = (product.images ?? [])
    .map((img: any) => img?.image)
    .filter(Boolean);
  const coverImage = images[activeImage] ?? images[0];

  const renderImage = (src: string, alt: string, className: string) =>
    isSeed ? (
      <img src={src} alt={alt} className={className} />
    ) : (
      <CloudImage
        publicId={src}
        alt={alt}
        crop="fill"
        fallback={<div className="w-full h-full flex items-center justify-center text-5xl bg-secondary/60">🛍️</div>}
        className={className}
      />
    );

  const handleAddToCart = () => {
    if (!inStock) return;
    const actualId = isSeed ? idStr : String(product.id);
    const cartItemId =
      Object.keys(selectedVariations).length > 0
        ? `${actualId}-${JSON.stringify(selectedVariations)}`
        : actualId;

    addItem({
      id: cartItemId,
      productId: actualId,
      name,
      price,
      image: coverImage,
      storeName,
      quantity,
      selected_variations: selectedVariations,
      in_stock: sellerHasStock,
    });
    toast.success(`${name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: `Check out ${name} on UbuntuNow`, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <ProductChrome useShell={useShell}>
      <>
        {/* Breadcrumb Header */}
        <div className="bg-secondary/30 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-foreground transition-colors shrink-0">Marketplace</Link>
            {catName && (
              <>
                <span className="text-border shrink-0">/</span>
                <span className="text-foreground shrink-0">{catName}</span>
              </>
            )}
            <span className="text-border shrink-0">/</span>
            <span className="text-foreground truncate">{name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-4 gap-2 text-muted-foreground hover:text-foreground hidden md:inline-flex"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14">

            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border group">
                {coverImage ? (
                  renderImage(
                    coverImage,
                    name,
                    "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-card transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-card transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                  aria-pressed={wishlisted}
                  onClick={() => setWishlisted((v) => !v)}
                  className={`absolute top-3 right-3 h-11 w-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm border ${
                    wishlisted
                      ? "bg-rose-500/15 border-rose-400/40 text-rose-500"
                      : "bg-card/80 border-border/50 text-muted-foreground hover:text-rose-500"
                  }`}
                >
                  <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                </button>

                {!inStock && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <span className="bg-card/95 text-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-border/60">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1} of ${images.length}`}
                      aria-current={i === activeImage}
                      className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === activeImage ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      {renderImage(img, `${name} thumbnail ${i + 1}`, "w-full h-full object-cover")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Details */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-5 border-b border-border/50 pb-5">
                <Link href={`/shop/${storeSlug}`} className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline mb-2">
                  <Store size={14} /> {storeName}
                </Link>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-[1.15] mb-3">
                  {name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {inStock ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      <CheckCircle size={14} /> In stock
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-500 font-medium bg-rose-500/10 px-2.5 py-1 rounded-md">
                      <XCircle size={14} /> Out of stock
                    </div>
                  )}

                  {sellerHasStock === true && (
                    <span className="text-primary font-medium">⚡ Quick delivery</span>
                  )}
                  {sellerHasStock === false && (
                    <span className="text-accent font-medium">📦 Same-day delivery</span>
                  )}

                  <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={14} /> Ships from Kigali
                  </div>
                </div>
              </div>

              <div className="mb-6">
                {isLoggedIn ? (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{formattedPrice}</span>
                    <span className="text-lg text-muted-foreground mb-1 font-semibold">RWF</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock size={18} />
                    <Link href="/auth" className="text-lg font-semibold text-primary hover:underline">
                      Sign in to see the price
                    </Link>
                  </div>
                )}
                {isLoggedIn && inStock && stock <= 5 && (
                  <p className="text-rose-500 font-medium text-sm flex items-center gap-1.5 mt-2">
                    <Clock size={14} /> Only {stock} left in stock
                  </p>
                )}
              </div>

              {/* Variations */}
              {product.variations && Object.keys(product.variations).length > 0 && (
                <div className="mb-6 space-y-5">
                  {Object.entries(product.variations).map(([variationName, options]: [string, any]) => {
                    const opts = Array.isArray(options) ? options : [];
                    if (opts.length === 0) return null;
                    return (
                      <div key={variationName}>
                        <h3 className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">{variationName}</h3>
                        <div className="flex flex-wrap gap-2">
                          {opts.map((option: string) => {
                            const isSelected = selectedVariations[variationName] === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setSelectedVariations((prev) => ({ ...prev, [variationName]: option }))}
                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                                    : "border-border bg-card text-foreground hover:border-primary/50"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Purchase panel */}
              <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 mb-8">
                {isLoggedIn ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <div className="flex items-center h-12 bg-card rounded-xl border border-border p-1 self-start">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={!inStock}
                          className="w-11 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-30"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="w-10 h-full flex items-center justify-center font-bold text-base tabular-nums">
                          {inStock ? quantity : 0}
                        </div>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                          disabled={!inStock}
                          className="w-11 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-30"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        size="lg"
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-semibold text-base border-border bg-card hover:bg-secondary"
                      >
                        Add to order
                      </Button>
                    </div>

                    <Button
                      onClick={handleBuyNow}
                      disabled={!inStock}
                      size="lg"
                      className="w-full h-12 rounded-xl font-bold text-base gradient-amber text-near-black shadow-amber border-0 hover:opacity-95 transition-opacity"
                    >
                      {inStock ? "Buy now" : "Currently unavailable"}
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg" className="w-full h-12 rounded-xl font-bold text-base gap-2">
                    <Link href="/auth?tab=register">
                      <Lock size={16} /> Sign in to buy
                    </Link>
                  </Button>
                )}

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Truck size={14} /> Confirmed orders ship same day from Kigali
                </div>
              </div>

              <PaymentOptions />

              {/* Description */}
              <div className="mt-10">
                <h3 className="text-lg font-bold text-foreground mb-3">Product details</h3>
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {description}
                </div>
              </div>

              {/* Share & Report */}
              <div className="mt-8 pt-5 border-t border-border flex items-center justify-between text-sm">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleShare}>
                  <Share2 size={16} /> Share item
                </Button>
                <a
                  href={`mailto:hello@ubuntunow.com?subject=${encodeURIComponent(`Reported item: ${name}`)}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
                >
                  <Mail size={16} /> Report issue
                </a>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-14 md:mt-20 pt-8 border-t border-border/60">
              <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="text-lg md:text-xl font-bold text-foreground">You might also like</h2>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={() => scrollRelated(-1)}
                    className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={() => scrollRelated(1)}
                    className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div
                ref={relatedTrackRef}
                className="flex overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-1 scroll-smooth"
              >
                {relatedProducts.map((p) => (
                  <div key={p.id} data-scroll-card className="w-[160px] sm:w-[190px] shrink-0">
                    <ProductCard
                      id={String(p.id)}
                      slug={p.slug || String(p.id)}
                      name={p.name}
                      price={Number(p.price)}
                      image={p.images?.[0]?.image}
                      storeName={p.store_name}
                      storeSlug={p.store_name?.toLowerCase().trim().replace(/\s+/g, "-")}
                      category={p.category}
                      inStock={p.stock_quantity > 0}
                      sellerHasStock={(p as any).in_stock}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </>
    </ProductChrome>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductPageContent />
    </Suspense>
  );
}
