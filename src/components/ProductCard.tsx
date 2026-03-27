import Link from "next/link";
import { Star, ShoppingCart, Heart, Store } from "lucide-react";
import { CloudImage } from "@/components/ui/CloudImage";

interface ProductCardProps {
  id: string;
  name: string;
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
  price,
  currency = "RWF",
  image,
  storeName,
  storeSlug,
  rating = 4.5,
  reviewCount = 12,
  category,
  inStock = true,
}: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);

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
        <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-card">
          <Heart size={14} />
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

        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-accent transition-colors leading-tight mb-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
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

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">{formattedPrice}</span>
            <span className="text-xs text-muted-foreground ml-1">{currency}</span>
          </div>
          <button
            disabled={!inStock}
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-card hover:shadow-ambient"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
