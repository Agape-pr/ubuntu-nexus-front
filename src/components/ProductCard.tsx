import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
  aspectRatio?: string;
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
  category,
  inStock = true,
  sellerHasStock,
  aspectRatio = "1/1",
}: ProductCardProps) => {
  const [wishlist, setWishlist] = useState(false);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({ id, name, price, image, storeName, storeId, in_stock: sellerHasStock, quantity: 1 });
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="group bg-[#1A1A19] rounded-[10px] overflow-hidden break-inside-avoid transition-all duration-200">
      {/* ── Image ── */}
      <div className="relative overflow-hidden w-full bg-black/20" style={{ aspectRatio }}>
        <Link href={`/product/${encodeURIComponent(slug || id)}`} className="block w-full h-full">
          {image ? (
            <CloudImage
              publicId={image}
              alt={name}
              width={400}
              className="w-full h-full object-contain object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <div className="text-5xl opacity-10">🛍️</div>
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="bg-[#1A1A19]/90 text-[#FBF8F2] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Out of stock
              </span>
            </div>
          )}
        </Link>

        {/* Wishlist heart — top right */}
        <button
          aria-label="Wishlist"
          onClick={(e) => { e.preventDefault(); setWishlist((v) => !v); }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className={`text-sm ${wishlist ? "text-red-500" : "text-white/80"}`}>
            {wishlist ? "♥" : "♡"}
          </span>
        </button>

        {/* Delivery badge — absolute bottom-left of image */}
        {sellerHasStock === true && (
          <span className="absolute bottom-0 left-0 text-[10px] bg-[#B87800] text-white px-1.5 py-0.5 leading-none">
            ⚡ Quick
          </span>
        )}
        {sellerHasStock === false && (
          <span className="absolute bottom-0 left-0 text-[10px] bg-[#B87800] text-white px-1.5 py-0.5 leading-none">
            📦 Same day
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="px-[10px] pt-[8px] pb-[10px]">
        {/* Product name */}
        <Link href={`/product/${encodeURIComponent(slug || id)}`}>
          <h3 className="text-[13px] text-[#FBF8F2] font-display line-clamp-2 leading-snug hover:text-[#B87800] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Store name (optional) */}
        {storeName && storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            className="text-[10px] text-[#888780] hover:text-[#B87800] transition-colors mt-0.5 block truncate"
          >
            {storeName}
          </Link>
        )}

        {/* Price row + Add button */}
        <div className="flex items-end justify-between mt-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-[#888780] leading-none">{currency}</span>
            <span className="text-[17px] font-black text-[#B87800] leading-none tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {formattedPrice}
            </span>
          </div>

          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="h-[28px] w-[28px] rounded-full bg-[#B87800] flex items-center justify-center hover:bg-[#F0B800] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={16} strokeWidth={3} className="text-[#111110]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
