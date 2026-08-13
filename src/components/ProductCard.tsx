"use client";

import Link from "next/link";
import { Plus, Star, Heart, Lock, ImageOff, Zap, Package } from "lucide-react";
import { CloudImage } from "@/components/ui/CloudImage";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "sonner";

import { makeStoreSlug } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price: number;
  /** Struck-through reference price — only rendered when it's actually greater than `price`. */
  originalPrice?: number;
  currency?: string;
  image?: string;
  storeName?: string;
  storeSlug?: string;
  storeId?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  /** Units currently available — shown as a small "N in stock" badge. */
  stockQuantity?: number;
  /** true = seller holds it now (quick). false = confirm & deliver same day. */
  sellerHasStock?: boolean;
  /**
   * "grid" = natural-height image, height-capped (used by ProductGrid's "All
   * products" masonry layout). "rail" (default) = fixed, shorter aspect ratio —
   * used in horizontal rails/carousels where cards must line up evenly.
   */
  layout?: "grid" | "rail";
  /** Hide the add-to-cart "+" button — e.g. New Arrivals is a taste, not the full buy flow. */
  showAddToCart?: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  currency = "RWF",
  image,
  storeName,
  storeSlug,
  storeId,
  rating,
  reviewCount,
  inStock = true,
  stockQuantity,
  sellerHasStock,
  layout = "rail",
  showAddToCart = true,
}: ProductCardProps) => {
  const wishlisted = useWishlistStore((s) => s.isWishlisted(id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);
  const { isLoggedIn } = useAuthState();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ id, name, price, image, storeName, storeSlug, slug });
  };

  const hasDiscount = typeof originalPrice === "number" && originalPrice > price;
  const discountPct = hasDiscount ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      id,
      name,
      price,
      image,
      storeName,
      storeId,
      in_stock: sellerHasStock,
      quantity: 1,
    });
    toast.success(`${name} added to cart!`);
  };

  const signInHref = "/auth?tab=register";
  const productHref = isLoggedIn
    ? `/product/${encodeURIComponent(slug || id)}`
    : signInHref;

  return (
    <div className={`group relative flex flex-col bg-card border border-border/80 rounded-xl transition-all duration-200 hover:border-primary/40 hover:shadow-md ${layout === "rail" ? "h-full" : ""}`}>
      {/* ── Image area ── */}
      <Link
        href={productHref}
        className="block relative p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className={`relative overflow-hidden rounded-lg bg-secondary/40 ${layout === "rail" ? "aspect-[4/3]" : ""}`}>
          {image ? (
            <CloudImage
              publicId={image}
              alt={name}
              width={400}
              className={
                layout === "grid"
                  ? "w-full h-auto max-h-[280px] object-cover block transition-transform duration-300 group-hover:scale-102"
                  : "w-full h-full object-cover block transition-transform duration-300 group-hover:scale-102"
              }
              fallback={
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-secondary/40">
                  <ImageOff size={20} className="opacity-20 text-muted-foreground" strokeWidth={1.5} />
                </div>
              }
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center bg-secondary/40">
              <ImageOff size={20} className="opacity-20 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}

          {/* Discount badge — subtle top-left */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded leading-none">
              -{discountPct}%
            </span>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-card text-foreground text-[10px] font-bold px-2.5 py-1 rounded border border-border text-center">
                Out of stock
              </span>
            </div>
          )}

          {/* Delivery badge — bottom-left */}
          {inStock && sellerHasStock === true && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-medium bg-background/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded border border-border/80 shadow-2xs">
              <Zap size={9} className="text-primary fill-primary" /> Express
            </span>
          )}
          {inStock && sellerHasStock === false && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-medium bg-background/90 backdrop-blur-sm text-muted-foreground px-2 py-0.5 rounded border border-border/80 shadow-2xs">
              <Package size={9} /> Same day
            </span>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            aria-pressed={wishlisted}
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
              wishlisted
                ? "bg-card/90 border-rose-200 text-rose-500 shadow-2xs"
                : "bg-card/70 border-border/60 text-muted-foreground hover:text-foreground hover:bg-card/90"
            }`}
          >
            <Heart
              size={13}
              className={wishlisted ? "text-rose-500 fill-rose-500" : ""}
            />
          </button>
        </div>
      </Link>

      {/* ── Product Info ── */}
      <div className={`flex flex-col p-2.5 pt-1.5 gap-1.5 ${layout === "rail" ? "flex-1 justify-between" : ""}`}>
        <div>
          <Link
            href={productHref}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs"
          >
            <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          {storeName && (
            <Link
              href={`/shop/${storeSlug || makeStoreSlug(storeName)}`}
              className="inline-block text-[11px] text-muted-foreground hover:text-foreground transition-colors truncate mt-0.5"
            >
              {storeName}
            </Link>
          )}
        </div>

        {/* Price & Cart CTA */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/40">
          {isLoggedIn ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-xs text-foreground tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">{currency}</span>
              </div>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground/60 line-through">
                  {new Intl.NumberFormat("en-RW").format(originalPrice!)}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Lock size={10} /> Sign in for price
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {typeof rating === "number" && rating > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </span>
            ) : (
              typeof stockQuantity === "number" && stockQuantity > 0 && stockQuantity <= 5 && (
                <span className="text-[10px] text-amber-600 font-medium">{stockQuantity} left</span>
              )
            )}

            {showAddToCart && (
              isLoggedIn ? (
                <button
                  type="button"
                  aria-label={`Add ${name} to cart`}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-7 w-7 shrink-0 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed border border-border/60"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              ) : (
                <Link
                  href={signInHref}
                  aria-label="Sign in to buy"
                  className="h-7 w-7 shrink-0 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150"
                >
                  <Lock size={11} />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid — masonry/waterfall layout via CSS columns: cards keep their
// natural (uncropped) image height, so columns settle at different lengths
// instead of being forced into equal-height rows.
// ─────────────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2.5 sm:gap-3">
      {products.map((product) => (
        <div key={product.id} className="break-inside-avoid mb-2.5 sm:mb-3">
          <ProductCard {...product} layout="grid" />
        </div>
      ))}
    </div>
  );
}
