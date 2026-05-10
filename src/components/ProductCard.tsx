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
    <div className="group bg-card rounded-xl overflow-hidden break-inside-avoid transition-all duration-200 hover:-translate-y-0.5">
      {/* ── Image ── */}
      <div className="relative overflow-hidden">
        <Link href={`/product/${encodeURIComponent(slug || id)}`} className="block">
          {image ? (
            <CloudImage
              publicId={image}
              alt={name}
              width={400}
              className="w-full h-auto min-h-[140px] object-cover"
            />
          ) : (
            <div className="w-full aspect-[3/4] flex items-center justify-center bg-white/5">
              <div className="text-5xl opacity-10">🛍️</div>
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="bg-card/90 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
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

        {/* Delivery badge — bottom left of image */}
        {sellerHasStock === true && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-gold-bright text-near-black px-1.5 py-0.5 rounded-sm leading-none">
            ⚡ Quick
          </span>
        )}
        {sellerHasStock === false && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-white/15 text-white px-1.5 py-0.5 rounded-sm leading-none backdrop-blur-sm">
            📦 Same day
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="px-2.5 pt-2 pb-2.5">
        {/* Product name */}
        <Link href={`/product/${encodeURIComponent(slug || id)}`}>
          <h3 className="text-[12.5px] font-medium text-foreground/90 line-clamp-2 leading-[17px] hover:text-gold-bright transition-colors">
            {name}
          </h3>
        </Link>

        {/* Store name */}
        {storeName && storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            className="text-[10px] text-muted-foreground hover:text-gold-accent transition-colors mt-0.5 block truncate"
          >
            {storeName}
          </Link>
        )}

        {/* Price row + Add button */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-gold-bright leading-none">{currency}</span>
            <span className="text-[15px] font-black text-gold-bright leading-none tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="h-6 w-6 rounded-full bg-gold-bright flex items-center justify-center hover:bg-gold-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={13} strokeWidth={3} className="text-near-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
