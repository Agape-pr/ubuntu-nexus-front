import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Store, Plus } from "lucide-react";
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
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  // true = seller owns stock; false = sources on order
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
  rating,
  reviewCount,
  category,
  inStock = true,
  sellerHasStock,
}: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({ id, name, price, image, storeName, quantity: 1 });
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="group bg-[#1C1C1A] rounded-[10px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden break-inside-avoid">
      {/* Image */}
      <div className="relative bg-secondary/20 overflow-hidden">
        <Link href={`/product/${encodeURIComponent(slug || id)}`} className="block w-full h-full relative">
          {image ? (
            <CloudImage
              publicId={image}
              alt={name}
              width={400}
              className="w-full h-auto min-h-[160px] object-cover"
            />
          ) : (
            <div className="w-full aspect-[4/5] flex items-center justify-center bg-white/5">
              <div className="text-4xl opacity-20">🛍️</div>
            </div>
          )}
          
          {/* Category Tag on Image (Optional, JD uses it sometimes for "New") */}
          {category && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-primary to-amber-600 text-white shadow-sm">
              {category}
            </span>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-card text-foreground text-[10px] font-semibold px-2 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="p-2.5 pb-3">
        <Link href={`/product/${encodeURIComponent(slug || id)}`}>
          <h3 className="font-semibold text-[13px] text-foreground/90 line-clamp-2 hover:text-primary transition-colors leading-[18px]">
            {name}
          </h3>
        </Link>

        {/* Delivery label — set by seller per product */}
        <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
          {sellerHasStock === false ? (
            <span className="text-[10px] font-semibold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-sm">⚡ Confirm &amp; deliver same day</span>
          ) : sellerHasStock === true ? (
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">✦ Ready for quick delivery</span>
          ) : (
            // Legacy products without the field yet — neutral fallback
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1 py-0.5 rounded-sm">Free Delivery</span>
          )}
        </div>

        {/* Store link (if any) */}
        {storeName && storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors mb-1.5 mt-1"
          >
            <span>{storeName}</span>
          </Link>
        )}

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-1.5">
          <div className="flex items-baseline text-primary">
            <span className="text-[11px] font-bold mr-[2px]">{currency}</span>
            <span className="text-base font-bold leading-none tracking-tight">{formattedPrice}</span>
          </div>
          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="h-[22px] w-[22px] rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
