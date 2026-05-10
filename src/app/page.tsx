"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/lib/api/hooks/useProducts";

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
      {/* Navbar — shown on all screen sizes; hamburger handles mobile nav */}
      <Navbar />

      {/* Desktop Header */}
      <div className="hidden md:block bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Marketplace</h1>
          <p className="text-muted-foreground">
            {allProducts.length} products from Kigali&apos;s finest sellers
          </p>
        </div>
      </div>

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
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1.5 md:gap-3 space-y-1.5 md:space-y-3">
              {sorted.map((product) => (
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
                  />
                </div>
              ))}
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
