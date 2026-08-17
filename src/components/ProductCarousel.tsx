"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/api/hooks/useProducts";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

import { makeStoreSlug } from "@/lib/utils";

/**
 * Real-product showcase for the landing page. Reuses ProductCard, which
 * already locks price/checkout behind sign-in for guests — this is a taste
 * of the catalog, not full browsing.
 */
export function ProductCarousel() {
  const { trackRef, scrollByCard } = useHorizontalScroll();
  const { data: allProducts = [], isLoading, isError } = useProducts();

  const products = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  if (isLoading || isError || products.length < 4) return null;

  return (
    <section className="min-h-screen flex flex-col justify-center py-16 bg-secondary/40 border-t border-border/60">
      <div className="container">
        <Reveal className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Products from local sellers</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByCard(-1)}
              className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByCard(1)}
              className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div
            ref={trackRef}
            className="flex overflow-x-auto no-scrollbar gap-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-smooth"
          >
            {products.map((product) => (
              <div key={product.id} data-scroll-card className="w-[160px] sm:w-[190px] shrink-0 snap-start">
                <ProductCard
                  id={String(product.id)}
                  slug={product.slug || String(product.id)}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.images?.[0]?.image}
                  storeName={product.store_name}
                  storeSlug={makeStoreSlug(product.store_name)}
                  category={product.category}
                  inStock={product.stock_quantity > 0}
                  stockQuantity={product.stock_quantity}
                  sellerHasStock={(product as { in_stock?: boolean }).in_stock}
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
