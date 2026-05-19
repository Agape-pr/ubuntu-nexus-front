"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/lib/api/hooks/useProducts";

import {
  ArrowRight, Store, ShieldCheck, Zap, Star, MapPin, 
  CheckCircle, ThumbsUp, CreditCard, PackageCheck, Sparkles,
  Heart, ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import images (make sure these exist or remove if not needed)
// import kigaliMarket from "@/assets/kigali-market.jpg";
// import kigaliSeller from "@/assets/kigali-seller.jpg";

const CATEGORIES = [
  "All",
  "Clothing & Fashion",
  "Electronics & Gadgets",
  "Beauty & Personal Care",
  "Bags & Accessories",
  "Home & Living",
  "Jewelry",
  "Books",
  "Other"
];

const SORT_OPTIONS = ["Most popular", "Newest", "Price: Low to High", "Price: High to Low"];

const HomeContent = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const [sortBy, setSortBy] = useState("Most popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allProducts = [], isLoading } = useProducts();

  const filtered = allProducts.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchSearch = (p.name || "").toLowerCase().includes(searchLower) ||
                        (p.store_name || "").toLowerCase().includes(searchLower);
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return Number(a.price) - Number(b.price);
    if (sortBy === "Price: High to Low") return Number(b.price) - Number(a.price);
    if (sortBy === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container md:py-8 pb-4 flex-1 px-2 sm:px-4">
        {/* Mobile Search Bar */}
        <div className="md:hidden relative mt-3 mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full h-10 pl-9 pr-10 rounded-full border border-border bg-secondary/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            placeholder="Search products or stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        {/* 1. HERO - Split Layout */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          <div className="absolute top-0 right-0 -m-32 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="max-w-2xl animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
                  <Sparkles size={14} className="text-accent" />
                  <span>The new era of local commerce</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-foreground leading-[1.05] mb-6 text-balance">
                  Buy and sell with{" "}
                  <span className="relative inline-block text-primary">
                    people you trust
                    <svg
                      className="absolute -bottom-2 left-0 w-full text-accent/40"
                      viewBox="0 0 200 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.00049 6.84039C50.0005 1.84039 120.501 -2.15961 198.001 6.84039"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  Start selling online in minutes. Discover unique products from
                  your neighbors, and shop securely with our 2-hour escrow
                  guarantee.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link href="/auth?tab=register&role=seller">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gradient-amber text-white font-semibold px-8 h-14 rounded-2xl shadow-amber hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-0"
                    >
                      Start your store <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-14 px-8 rounded-2xl border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all duration-300"
                    >
                      Explore marketplace
                    </Button>
                  </Link>
                </div>

                {/* Trust bar */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald" />
                    <span className="font-medium text-foreground">100% Secure</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {["🧑🏿", "👩🏾", "👨🏿"].map((emoji, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] z-10 shadow-sm"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-xs font-semibold text-emerald-700">
                      🌱 Early Access — Be a founding seller
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Images Collage */}
              <div className="relative h-[450px] lg:h-[600px] w-full lg:w-[110%] animate-slide-in-right hidden md:block">
                <div className="absolute inset-0 rounded-3xl bg-secondary transform rotate-3" />

                <div className="absolute top-4 left-4 right-12 bottom-12 rounded-3xl overflow-hidden shadow-lift border-4 border-card group bg-secondary">
                  {/* Replace with actual image or remove */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">Market Image</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-2 w-2 rounded-full bg-emerald animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">Live</span>
                    </div>
                  </div>
                </div>

                {/* Floating Element 1 - Small Image */}
                <div className="absolute -bottom-6 -left-6 h-48 w-40 rounded-2xl overflow-hidden shadow-ambient border-4 border-card z-20 group bg-secondary">
                  <div className="w-full h-full bg-gradient-to-tr from-accent/20 to-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Seller</span>
                  </div>
                </div>

                {/* Floating Element 2 - Glassmorphism Badge */}
                <div className="absolute top-12 -right-8 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-lift border border-border/50 z-30 animate-float flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">Within 2 hours</p>
                  </div>
                </div>

                {/* Floating Element 3 - Rating Card */}
                <div
                  className="absolute bottom-24 -right-2 bg-card p-3 rounded-2xl shadow-lift border border-border z-30 animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    <span className="font-bold">Kigali local vendors</span>
                    <br />
                    Best platform ever!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Search & Controls */}
        <div className="hidden md:flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products or stores..."
              className="pl-10 h-11 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle filters"
              className="h-11 w-11 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 md:mb-8 mb-4 pb-2 pt-2 md:pt-0 snap-x">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center justify-center shrink-0 snap-start gap-1"
            >
              <div className={`w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2 flex items-center justify-center transition-all duration-200 ${
                  selectedCategory === cat
                  ? "bg-primary text-primary-foreground md:rounded-full rounded-2xl shadow-sm"
                  : "bg-card text-muted-foreground md:rounded-full rounded-2xl shadow-sm hover:bg-primary/5 border border-border"
                }`}>
                <span className="md:block hidden text-sm font-medium">{cat}</span>
                <div className="md:hidden text-lg">
                  {i === 0 ? '🌟' : i === 1 ? '👕' : i === 2 ? '💻' : i === 3 ? '💄' : i === 4 ? '👜' : i === 5 ? '🏠' : i === 6 ? '💍' : i === 7 ? '📚' : '✨'}
                </div>
              </div>
              <span className="md:hidden text-[11px] font-medium text-foreground">{cat}</span>
            </button>
          ))}
        </div>

        {/* Action Banners (Mobile mostly) */}
        <div className="flex md:hidden flex-col gap-2 mb-6">
          <Link href="/home" className="flex items-center gap-3 bg-secondary/50 border border-border/50 p-3 rounded-2xl hover:bg-secondary transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="text-blue-500 text-sm">💡</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Learn how it works</p>
              <p className="text-xs text-muted-foreground">Discover the UbuntuNow platform</p>
            </div>
          </Link>
          <Link href="/auth?tab=register&intent=seller" className="flex items-center gap-3 bg-secondary/50 border border-border/50 p-3 rounded-2xl hover:bg-secondary transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <span className="text-emerald-500 text-sm">🏪</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Start your store</p>
              <p className="text-xs text-muted-foreground">Sell your products to thousands</p>
            </div>
          </Link>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">Try a different search or category</p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <p className="hidden md:block text-sm text-muted-foreground mb-4">
              {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
            </p>

            {/* Mobile: two independent flex-column divs, strict index distribution */}
            <div className="md:hidden flex gap-[6px] px-[6px] items-start bg-[#111110]">
              {(() => {
                const left: { p: typeof sorted[0], ratio: string }[] = [];
                const right: { p: typeof sorted[0], ratio: string }[] = [];
                const ASPECT_RATIO_PATTERN = ['3/4', '1/1', '4/3', '1/1'];

                sorted.forEach((p, i) => {
                  const ratio = ASPECT_RATIO_PATTERN[i % 4];
                  if (i % 2 === 0) {
                    left.push({ p, ratio });
                  } else {
                    right.push({ p, ratio });
                  }
                });

                const renderCol = (items: { p: typeof sorted[0], ratio: string }[]) => (
                  <div className="flex-1 flex flex-col gap-[6px]">
                    {items.map(({ p, ratio }) => (
                      <ProductCard
                        key={p.id}
                        id={String(p.id)}
                        slug={p.slug || String(p.id)}
                        name={p.name}
                        price={Number(p.price)}
                        image={p.images?.[0]?.image}
                        storeName={p.store_name}
                        storeSlug={p.store_name ? p.store_name.toLowerCase().replace(/\s+/g, '-') : undefined}
                        category={p.category}
                        inStock={p.stock_quantity > 0}
                        sellerHasStock={(p as any).in_stock}
                        aspectRatio={ratio}
                      />
                    ))}
                  </div>
                );

                return (
                  <>
                    {renderCol(left)}
                    {renderCol(right)}
                  </>
                );
              })()}
            </div>

            {/* Desktop: CSS columns (3–5 cols) */}
            <div className="hidden md:block columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
              {sorted.map((product, i) => {
                const ASPECT_RATIO_PATTERN = ['3/4', '1/1', '4/3', '1/1'];
                const ratio = ASPECT_RATIO_PATTERN[i % 4];
                return (
                  <div key={product.id} className="break-inside-avoid">
                    <ProductCard
                      id={String(product.id)}
                      slug={product.slug || String(product.id)}
                      name={product.name}
                      price={Number(product.price)}
                      image={product.images?.[0]?.image}
                      storeName={product.store_name}
                      storeSlug={product.store_name ? product.store_name.toLowerCase().replace(/\s+/g, '-') : undefined}
                      category={product.category}
                      inStock={product.stock_quantity > 0}
                      sellerHasStock={(product as any).in_stock}
                      aspectRatio={ratio}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

const Home = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}>
    <HomeContent />
  </Suspense>
);

export default Home;