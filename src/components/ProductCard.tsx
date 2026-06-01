"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Star, Heart } from "lucide-react";
import { CloudImage } from "@/components/ui/CloudImage";
import { useCartStore } from "@/lib/store/cartStore";
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

  const productHref = `/product/${encodeURIComponent(slug || id)}`;

  // Render filled stars
  const renderStars = (value: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(value);
      const partial = !filled && i < value;
      return (
        <span key={i} className="relative inline-block">
          <Star
            size={9}
            className="text-white/15"
            fill="currentColor"
          />
          {(filled || partial) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : `${(value % 1) * 100}%` }}
            >
              <Star size={9} className="text-[#F0B800]" fill="currentColor" />
            </span>
          )}
        </span>
      );
    });
  };

  return (
    // h-full + flex-col so all cards in a grid row stretch to equal height
    <div className="group relative flex flex-col h-full bg-[#1A1A19] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
      {/* ── Image area ── */}
      <Link href={productHref} className="block relative overflow-hidden aspect-square shrink-0">
        {image ? (
          <CloudImage
            publicId={image}
            alt={name}
            width={400}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <div className="text-4xl opacity-10">🛍️</div>
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-[#1A1A19]/90 text-[#FBF8F2] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              Out of stock
            </span>
          </div>
        )}

        {/* Delivery badge — bottom-left, pill style */}
        {inStock && sellerHasStock === true && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-[#B87800]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full leading-none">
            ⚡ Quick
          </span>
        )}
        {inStock && sellerHasStock === false && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-[#1A1A19]/80 backdrop-blur-sm text-[#F0B800] border border-[#F0B800]/30 px-2 py-0.5 rounded-full leading-none">
            📦 Same day
          </span>
        )}

        {/* Wishlist — top-right, appears on hover */}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted((v) => !v);
          }}
          className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
            wishlisted 
              ? "bg-red-500/20 border-red-400/40 opacity-100" 
              : "bg-black/30 border-white/10 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            size={13}
            className={wishlisted ? "text-red-400 fill-red-400" : "text-white/80"}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </Link>

      {/* ── Info — flex-col + flex-1 so bottom content is always flush ── */}
      <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-1">
        {/* Product name — clamps to 2 lines, reserves space */}
        <Link href={productHref}>
          <h3 className="text-[12.5px] text-[#FBF8F2] font-medium leading-snug line-clamp-2 hover:text-[#F0B800] transition-colors min-h-[2.6em]">
            {name}
          </h3>
        </Link>

        {/* Store name */}
        {storeName && storeSlug ? (
          <Link
            href={`/store/${storeSlug}`}
            className="text-[10px] text-[#666560] hover:text-[#B87800] transition-colors truncate"
          >
            {storeName}
          </Link>
        ) : null}

        {/* Rating */}
        {typeof rating === "number" && rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {renderStars(rating)}
            </div>
            {typeof reviewCount === "number" && reviewCount > 0 && (
              <span className="text-[10px] text-[#555450]">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price row + Add to cart — mt-auto keeps it at the bottom without a spacer gap */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-0.5 min-w-0">
            <span className="text-[10px] text-[#666560] shrink-0">{currency}</span>
            <span
              className="text-[15px] font-black text-[#F0B800] leading-none tracking-tight truncate"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {formattedPrice}
            </span>
          </div>

          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="
              h-7 w-7 shrink-0 rounded-full
              bg-[#B87800] flex items-center justify-center
              hover:bg-[#F0B800] active:scale-95
              transition-all duration-150
              disabled:opacity-25 disabled:cursor-not-allowed
              shadow-[0_2px_8px_rgba(184,120,0,0.4)]
            "
          >
            <Plus size={14} strokeWidth={3} className="text-[#111110]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid — drop this in your page/section to get correct responsive columns
// Each card stretches to equal height via `grid` + `h-full` on the card itself.
// ─────────────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div
      className="
        grid gap-2.5
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
      "
    >
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}