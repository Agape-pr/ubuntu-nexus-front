"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Star, Heart, Lock } from "lucide-react";
import { CloudImage } from "@/components/ui/CloudImage";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price: number;
  currency?: string;
  image?: string;
  storeName?: string;
  storeSlug?: string;
  storeId?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  /** true = seller holds it now (quick). false = confirm & deliver same day. */
  sellerHasStock?: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  currency = "RWF",
  image,
  storeName,
  storeSlug,
  storeId,
  rating,
  reviewCount,
  inStock = true,
  sellerHasStock,
}: ProductCardProps) => {
  const [wishlisted, setWishlisted] = useState(false);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);
  const { isLoggedIn } = useAuthState();

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

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(value);
      const partial = !filled && i < value;
      return (
        <span key={i} className="relative inline-block">
          <Star size={9} className="text-foreground/15" fill="currentColor" />
          {(filled || partial) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : `${(value % 1) * 100}%` }}
            >
              <Star size={9} className="text-accent" fill="currentColor" />
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="group relative flex flex-col h-full bg-card border border-border/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-border md:hover:shadow-lg md:hover:-translate-y-0.5">
      {/* ── Image area ── */}
      <Link
        href={productHref}
        className="block relative overflow-hidden aspect-square shrink-0 bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {image ? (
          <CloudImage
            publicId={image}
            alt={name}
            width={400}
            className="w-full h-full object-cover object-center transition-transform duration-500 md:group-hover:scale-105"
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                <span className="text-3xl opacity-30">🛍️</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/50">
            <span className="text-3xl opacity-30">🛍️</span>
          </div>
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
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-primary/95 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full leading-none">
            ⚡ Quick
          </span>
        )}
        {inStock && sellerHasStock === false && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-card/90 backdrop-blur-sm text-accent border border-accent/30 px-2 py-0.5 rounded-full leading-none">
            📦 Same day
          </span>
        )}

        {/* Wishlist — top-right; always visible on touch, hover-reveal on desktop */}
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={wishlisted}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted((v) => !v);
          }}
          className={`absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
            wishlisted
              ? "bg-rose-500/15 border-rose-400/40 opacity-100"
              : "bg-background/40 border-border/40 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <Heart
            size={14}
            className={wishlisted ? "text-rose-400" : "text-cream"}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </Link>

      {/* ── Info — flex-col + flex-1 so bottom content is always flush ── */}
      <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-1">
        <Link
          href={productHref}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <h3 className="text-[12.5px] text-foreground font-medium leading-snug line-clamp-2 hover:text-primary transition-colors min-h-[2.6em]">
            {name}
          </h3>
        </Link>

        {storeName && storeSlug ? (
          <Link
            href={`/shop/${storeSlug}`}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors truncate"
          >
            {storeName}
          </Link>
        ) : null}

        {typeof rating === "number" && rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
            {typeof reviewCount === "number" && reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground/70">({reviewCount})</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          {isLoggedIn ? (
            <div className="flex items-baseline gap-0.5 min-w-0">
              <span className="text-[10px] text-muted-foreground shrink-0">{currency}</span>
              <span
                className="text-[15px] font-black text-accent leading-none tracking-tight truncate"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {formattedPrice}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground truncate">
              <Lock size={10} /> Sign in for price
            </span>
          )}

          {isLoggedIn ? (
            <button
              type="button"
              aria-label={`Add ${name} to cart`}
              onClick={handleAddToCart}
              disabled={!inStock}
              className="h-9 w-9 shrink-0 rounded-full bg-primary flex items-center justify-center hover:bg-accent active:scale-95 transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed shadow-sm"
            >
              <Plus size={15} strokeWidth={3} className="text-primary-foreground" />
            </button>
          ) : (
            <Link
              href={signInHref}
              aria-label="Sign in to buy"
              className="h-9 w-9 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-all duration-150"
            >
              <Lock size={13} className="text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid — drop this in your page/section to get correct responsive columns.
// Equal-height cards via `grid` + `h-full` on the card itself (no masonry).
// ─────────────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
