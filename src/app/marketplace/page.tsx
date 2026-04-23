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

const CATEGORIES = ["All", "Fashion", "Food", "Crafts", "Beauty", "Tech", "Books", "Home"];

const SORT_OPTIONS = ["Most popular", "Newest", "Price: Low to High", "Price: High to Low"];

const MarketplaceContent = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sync search input when URL param changes (e.g. navigating from Navbar search)
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);
  const [sortBy, setSortBy] = useState("Most popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allProducts = [], isLoading } = useProducts();

  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.store_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || p.category_name === selectedCategory;
    return matchSearch && matchCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return Number(a.price) - Number(b.price);
    if (sortBy === "Price: High to Low") return Number(b.price) - Number(a.price);
    if (sortBy === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] dark:bg-background">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#F5F5F5] dark:bg-background pt-10 pb-2 px-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-xl text-foreground">首页</span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">¥ 888免运</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center shrink-0 w-8">
             <div className="text-[10px] text-muted-foreground whitespace-nowrap">US</div>
          </div>
          <div className="flex-1 relative flex items-center h-9 rounded-full border-2 border-rose-500 bg-card overflow-hidden">
             <Search size={14} className="ml-3 text-rose-500 shrink-0" />
             <input
                className="flex-1 h-full bg-transparent border-none text-xs px-2 focus:outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="搜索京东商品/店铺"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
             <div className="h-full bg-rose-500 text-white text-xs font-bold px-4 flex items-center justify-center cursor-pointer">
                搜索
             </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Marketplace</h1>
          <p className="text-muted-foreground">
            {allProducts.length} products from Kigali's finest sellers
          </p>
        </div>
      </div>

      <div className="container md:py-8 pb-4 flex-1 px-2 sm:px-4">
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

        {/* Categories Mobile Horizontal Scroll */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 md:mb-8 mb-4 pb-2 pt-2 md:pt-0 snap-x">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center justify-center shrink-0 snap-start gap-1"
            >
              <div className={`w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2 flex items-center justify-center transition-all duration-200 ${
                  selectedCategory === cat
                  ? "bg-rose-500 text-white md:rounded-full rounded-2xl shadow-sm"
                  : "bg-white text-muted-foreground md:rounded-full rounded-2xl shadow-sm hover:bg-rose-50"
                }`}>
                <span className="md:block hidden text-sm font-medium">{cat}</span>
                <div className="md:hidden text-lg">
                   {/* Dummy emojis for categories */}
                   {i === 0 ? '🌟' : i === 1 ? '👕' : i === 2 ? '🍔' : i === 3 ? '🎨' : i === 4 ? '💄' : i === 5 ? '💻' : i === 6 ? '📚' : '🏠'}
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
            <p className="text-muted-foreground text-sm">
              Try a different search or category
            </p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
              {sorted.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  slug={product.name}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.images?.[0]?.image}
                  storeName={product.store_name}
                  storeSlug={product.store_name?.toLowerCase().replace(/\s+/g, '-')}
                  category={product.category_name}
                  inStock={product.stock_quantity > 0}
                />
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

const Marketplace = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}>
    <MarketplaceContent />
  </Suspense>
);

export default Marketplace;
