"use client";

import Link from "next/link";
import { Plus, Star, Heart, Lock, ImageOff, Zap, Package } from "lucide-react";
import { CloudImage } from "@/components/ui/CloudImage";
import { useCartStore } from "@/lib/store/cartStore";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "sonner";

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
  const wishlisted = useFavoritesStore((s) => s.isFavorite(id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);
  const { isLoggedIn } = useAuthState();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ id, name, price, image, storeName, storeSlug, slug });
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
    <div className={`group relative flex flex-col bg-card border border-border/60 rounded-xl transition-all duration-200 hover:border-border md:hover:shadow-lg md:hover:-translate-y-0.5 ${layout === "rail" ? "h-full" : ""}`}>
      {/* ── Image area — padded frame so the photo never touches the card edge.
          "grid" keeps the image's true natural height (masonry); "rail" uses a fixed, short aspect ratio ── */}
      <Link
        href={productHref}
        className="block relative p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className={`relative overflow-hidden rounded-lg bg-secondary/50 ${layout === "rail" ? "aspect-[4/3]" : ""}`}>
          {image ? (
            <CloudImage
              publicId={image}
              alt={name}
              width={400}
              className={
                layout === "grid"
                  ? "w-full h-auto max-h-[300px] object-cover block transition-transform duration-500 md:group-hover:scale-105"
                  : "w-full h-full object-cover block transition-transform duration-500 md:group-hover:scale-105"
              }
              fallback={
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-secondary/50">
                  <ImageOff size={22} className="opacity-25" strokeWidth={1.5} />
                </div>
              }
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center bg-secondary/50">
              <ImageOff size={22} className="opacity-25" strokeWidth={1.5} />
            </div>
          )}

          {/* Discount badge — top-left */}
          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm">
              -{discountPct}%
            </span>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="bg-card/95 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-border/60">
                Out of stock
              </span>
            </div>
          )}

          {/* Delivery badge — bottom-left, pill style */}
          {inStock && sellerHasStock === true && (
            <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 text-[10px] font-bold bg-primary/95 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full leading-none">
              <Zap size={9} className="fill-current" /> Quick
            </span>
          )}
          {inStock && sellerHasStock === false && (
            <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 text-[10px] font-bold bg-card/90 backdrop-blur-sm text-accent border border-accent/30 px-2 py-0.5 rounded-full leading-none">
              <Package size={9} /> Same day
            </span>
          )}

          {/* Wishlist — top-right; always visible on touch, hover-reveal on desktop */}
          <button
            type="button"
            aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            aria-pressed={wishlisted}
            onClick={handleToggleFavorite}
            className={`absolute top-1.5 right-1.5 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
              wishlisted
                ? "bg-rose-500/15 border-rose-400/40 opacity-100"
                : "bg-background/40 border-border/40 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <Heart
              size={13}
              className={wishlisted ? "text-rose-400" : "text-cream"}
              fill={wishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>
      </Link>

      {/* ── Info — everything packed tight, no reserved whitespace ── */}
      <div className={`flex flex-col px-2 pt-0.5 pb-2 gap-0 ${layout === "rail" ? "flex-1" : ""}`}>
        <div>
          <Link
            href={productHref}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <h3 className="text-[12px] text-foreground font-medium leading-snug line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          {storeName && storeSlug && (
            <Link
              href={`/shop/${storeSlug}`}
              className="block text-[10px] text-muted-foreground hover:text-primary transition-colors truncate"
            >
              {storeName}
            </Link>
          )}
        </div>

        {/* Price — sits right under the name block, no gap */}
        <div className={`flex items-end justify-between gap-1 ${layout === "rail" ? "mt-auto" : ""}`}>
          {isLoggedIn ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-0.5 min-w-0">
                <span className="text-[9px] text-muted-foreground shrink-0">{currency}</span>
                <span className="font-display text-[13px] font-black text-accent leading-none tracking-tight">
                  {formattedPrice}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-[9px] text-muted-foreground/60 line-through">
                  {new Intl.NumberFormat("en-RW").format(originalPrice!)}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground truncate">
              <Lock size={10} /> Sign in for price
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {typeof rating === "number" && rating > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                <Star size={9} className="fill-accent text-accent" />
                {rating.toFixed(1)}
              </span>
            ) : (
              typeof stockQuantity === "number" && stockQuantity > 0 && (
                <span className="text-[9px] text-muted-foreground/70">{stockQuantity} left</span>
              )
            )}

            {showAddToCart && (
              isLoggedIn ? (
                <button
                  type="button"
                  aria-label={`Add ${name} to cart`}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-6 w-6 shrink-0 rounded-full bg-primary flex items-center justify-center hover:bg-accent active:scale-95 transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus size={12} strokeWidth={3} className="text-primary-foreground" />
                </button>
              ) : (
                <Link
                  href={signInHref}
                  aria-label="Sign in to buy"
                  className="h-6 w-6 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-all duration-150"
                >
                  <Lock size={11} className="text-muted-foreground" />
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
