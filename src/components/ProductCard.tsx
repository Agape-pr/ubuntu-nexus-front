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
}: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const addItem = useCartStore((state) => state.addItem);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({ id, name, price, image, storeName, quantity: 1 });
    toast.success(`${name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="group bg-card rounded-2xl shadow-card hover:shadow-lift transition-all duration-300 overflow-hidden border border-border/50 hover:border-border">
      {/* Image */}
      <div className="relative h-52 bg-secondary overflow-hidden">
        {image ? (
          <CloudImage
            publicId={image}
            alt={name}
            width={400}
            crop="fill"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">🛍️</div>
          </div>
        )}
        {/* Wishlist */}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-card ${wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
        >
          <Heart size={14} className={wishlisted ? "fill-rose-500" : ""} />
        </button>
        {/* Category */}
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium backdrop-blur-sm">
            {category}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Store link */}
        {storeName && storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors mb-2"
          >
            <Store size={11} />
            <span>{storeName}</span>
          </Link>
        )}

        <Link href={`/product/${encodeURIComponent(slug || id)}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-accent transition-colors leading-tight mb-2">
            {name}
          </h3>
        </Link>

        {/* Rating — only shown when real data is provided */}
        {rating !== undefined && reviewCount !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(rating)
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted-foreground"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-end text-primary">
            <span className="text-xs font-semibold mb-0.5">{currency}</span>
            <span className="text-lg font-bold leading-none">{formattedPrice}</span>
          </div>
          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="h-6 w-6 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
