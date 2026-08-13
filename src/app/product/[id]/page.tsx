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
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useAuthState } from "@/hooks/useAuthState";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { CloudImage } from "@/components/ui/CloudImage";
import { resolveCategoryName } from "@/lib/categories";
import { toast } from "sonner";
import {
  ArrowLeft, Heart, Store, Truck, MapPin, Clock, Share2, Plus, Minus,
  CheckCircle, XCircle, Mail, PackageSearch, ChevronLeft, ChevronRight, Lock,
  ShoppingCart, Banknote, Landmark, ImageOff, Zap, Package,
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

function ProductChrome({
  useShell,
  children,
}: {
  useShell: boolean;
  children: React.ReactNode;
}) {
  if (useShell) {
    return <BuyerDashboardShell hideMobileBottomNav>{children}</BuyerDashboardShell>;
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
  const cartCount = useCartStore((state) => state.getTotalItems());
  const { isLoggedIn, userRole } = useAuthState();
  const useShell = isLoggedIn && userRole !== "seller";
  const { trackRef: relatedTrackRef, scrollByCard: scrollRelated } = useHorizontalScroll();

  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);

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
    const category = resolveCategoryName(product.category);
    return allProducts
      .filter((p) => resolveCategoryName(p.category) === category && String(p.id) !== String(product.id))
      .slice(0, 6);
  }, [allProducts, product, isSeed]);

  const favoriteId = product ? (isSeed ? idStr : String(product.id)) : "";
  const wishlisted = useFavoritesStore((s) => s.isFavorite(favoriteId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

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
  const actualId = isSeed ? idStr : String(product.id);
  const name = product.name;
  const price = Number(product.price);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const stock = Number(product.stock_quantity);
  const inStock = stock > 0;
  const description = product.description || "No description provided.";
  const catName = resolveCategoryName(product.category);
  const sellerHasStock: boolean | undefined = product.in_stock;

  // The list endpoint (used for relatedProducts) reliably returns store_name;
  // fall back to it if this product's own detail response omits the field.
  // Some products' store_name genuinely comes back null from the API with no
  // way to resolve it client-side — in that case we show a plain label instead
  // of a link, rather than sending buyers to a /shop/[slug] that can't exist.
  const listMatch = !isSeed
    ? allProducts.find((p) => String(p.id) === String(product.id) || p.slug === idStr)
    : undefined;
  const resolvedStoreName: string | null =
    product.store?.store_name || product.store_name || listMatch?.store_name || null;
  const storeName = resolvedStoreName || "Store info unavailable";
  const storeSlug = product.store?.slug || product.storeSlug || (resolvedStoreName ? makeStoreSlug(resolvedStoreName) : null);

  const images: string[] = (product.images ?? [])
    .map((img: any) => img?.image)
    .filter(Boolean);
  const coverImage = images[activeImage] ?? images[0];

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: favoriteId,
      name,
      price,
      image: coverImage,
      storeName: resolvedStoreName || undefined,
      storeSlug: storeSlug || undefined,
      slug: isSeed ? undefined : product.slug,
    });
  };

  const renderImage = (src: string, alt: string, className: string) =>
    isSeed ? (
      <img src={src} alt={alt} className={className} />
    ) : (
      <CloudImage
        publicId={src}
        alt={alt}
        crop="fill"
        fallback={<div className="w-full h-full flex items-center justify-center bg-secondary/60"><ImageOff size={32} className="opacity-25" strokeWidth={1.5} /></div>}
        className={className}
      />
    );

  const handleAddToCart = () => {
    if (!inStock) return;
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
        {/* Breadcrumb Header — desktop only; mobile shows the image immediately, back/cart float on it */}
        <div className="hidden lg:block bg-secondary/30 border-b border-border/50">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 md:pb-10 lg:pt-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-4 gap-2 text-muted-foreground hover:text-foreground hidden md:inline-flex"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-0 lg:gap-14">

            {/* LEFT: Image Gallery — full-bleed on mobile, padded card on desktop */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-border group">
                {coverImage ? (
                  renderImage(
                    coverImage,
                    name,
                    "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageOff size={40} className="opacity-25" strokeWidth={1.5} /></div>
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
                    <span className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-md text-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                      {activeImage + 1}/{images.length}
                    </span>
                  </>
                )}

                {/* Back — floats on the image, mobile only (desktop uses the Back button above) */}
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => router.back()}
                  className="lg:hidden absolute top-3 left-3 h-10 w-10 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground z-10"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Cart — floats on the image, mobile only (desktop has it in the top navbar / sidebar) */}
                <Link
                  href="/cart"
                  aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Cart"}
                  className="lg:hidden absolute top-3 right-3 h-10 w-10 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground z-10"
                >
                  <ShoppingCart size={19} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-4 min-w-4 rounded-full bg-accent flex items-center justify-center px-1 text-[9px] font-bold text-near-black">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                  aria-pressed={wishlisted}
                  onClick={handleToggleFavorite}
                  className={`absolute top-3 right-16 lg:right-3 h-11 w-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm border ${
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
                <div className="hidden lg:flex gap-2 overflow-x-auto no-scrollbar">
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
              {/* Price ticket — sits flush under the image on mobile, no gap */}
              <div className="-mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-5 py-3 lg:py-4 bg-primary/5 border-b border-primary/15 lg:border lg:rounded-2xl lg:mb-5">
                {isLoggedIn ? (
                  <div className="flex items-end justify-between gap-3 flex-wrap">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground font-semibold">RWF</span>
                      <span className="font-display text-3xl font-black text-accent tracking-tight">
                        {formattedPrice}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      {sellerHasStock === true && (
                        <span className="inline-flex items-center gap-1 text-primary text-xs font-bold"><Zap size={12} className="fill-current" /> Quick delivery</span>
                      )}
                      {sellerHasStock === false && (
                        <span className="inline-flex items-center gap-1 text-accent text-xs font-bold"><Package size={12} /> Same-day delivery</span>
                      )}
                      {inStock && stock <= 5 ? (
                        <p className="text-rose-500 font-semibold text-xs mt-0.5">Only {stock} left</p>
                      ) : (
                        <p className="text-muted-foreground text-xs mt-0.5">{stock} in stock</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link href="/auth" className="flex items-center gap-2 text-primary font-semibold">
                    <Lock size={16} /> Sign in to see the price
                  </Link>
                )}
              </div>

              <div className="mb-5 border-b border-border/50 pb-5 pt-5 lg:pt-0">
                {storeSlug ? (
                  <Link href={`/shop/${storeSlug}`} className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline mb-2">
                    <Store size={14} /> {storeName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-semibold mb-2">
                    <Store size={14} /> {storeName}
                  </span>
                )}

                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground leading-[1.15] mb-3">
                  {name}
                </h1>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap mb-3">
                  {description}
                </p>

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

                  <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={14} /> Ships from Kigali
                  </div>
                </div>
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
                {isLoggedIn && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Quantity</span>
                    <div className="flex items-center h-11 bg-card rounded-xl border border-border p-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={!inStock}
                        className="w-10 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Minus size={15} />
                      </button>
                      <div className="w-10 h-full flex items-center justify-center font-bold text-base tabular-nums">
                        {inStock ? quantity : 0}
                      </div>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                        disabled={!inStock}
                        className="w-10 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action row — left to right: Store, Favorites, Add to Cart, Buy Now (priority order, Buy Now rightmost) */}
                <div className="grid grid-cols-4 gap-2">
                  {storeSlug ? (
                    <Link
                      href={`/shop/${storeSlug}`}
                      className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      <Store size={18} />
                      <span className="text-[10px] font-semibold">Store</span>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border border-border/50 bg-card text-muted-foreground/50 cursor-not-allowed">
                      <Store size={18} />
                      <span className="text-[10px] font-semibold">Store</span>
                    </div>
                  )}

                  <button
                    type="button"
                    aria-pressed={wishlisted}
                    onClick={handleToggleFavorite}
                    className={`flex flex-col items-center justify-center gap-1 h-16 rounded-xl border transition-colors ${
                      wishlisted
                        ? "border-rose-400/40 bg-rose-500/10 text-rose-400"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                    <span className="text-[10px] font-semibold">Favorite</span>
                  </button>

                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                      <span className="text-[10px] font-bold">Add to Cart</span>
                    </button>
                  ) : (
                    <Link
                      href="/auth?tab=register"
                      className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Lock size={18} />
                      <span className="text-[10px] font-bold">Add to Cart</span>
                    </Link>
                  )}

                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={!inStock}
                      className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl gradient-amber text-near-black shadow-amber border-0 hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="text-[11px] font-black">{inStock ? "Buy Now" : "Sold out"}</span>
                      <div className="flex items-center gap-1">
                        <Banknote size={11} />
                        <span className="h-3.5 w-3.5 rounded-full bg-[#FFCC00] flex items-center justify-center text-black text-[6px] font-black leading-none">M</span>
                        <span className="h-3.5 w-3.5 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-[6px] font-black leading-none">A</span>
                        <Landmark size={11} />
                      </div>
                    </button>
                  ) : (
                    <Link
                      href="/auth?tab=register"
                      className="flex flex-col items-center justify-center gap-1 h-16 rounded-xl gradient-amber text-near-black shadow-amber border-0 hover:opacity-95 transition-opacity"
                    >
                      <Lock size={16} />
                      <span className="text-[11px] font-black">Buy Now</span>
                    </Link>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Truck size={14} /> Confirmed orders ship same day from Kigali
                </div>
              </div>

              <PaymentOptions />

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
                      stockQuantity={p.stock_quantity}
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
