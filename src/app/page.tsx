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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/lib/api/hooks/useProducts";

import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All",                    emoji: "🌟" },
  { label: "Clothing & Fashion",     emoji: "👕" },
  { label: "Electronics & Gadgets",  emoji: "💻" },
  { label: "Beauty & Personal Care", emoji: "💄" },
  { label: "Bags & Accessories",     emoji: "👜" },
  { label: "Home & Living",          emoji: "🏠" },
  { label: "Jewelry",                emoji: "💍" },
  { label: "Books",                  emoji: "📚" },
  { label: "Other",                  emoji: "✨" },
];

const SORT_OPTIONS = [
  "Most popular",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
];

// Alternating masonry aspect-ratio pattern
const ASPECT_RATIO_PATTERN = ["3/4", "1/1", "4/3", "1/1"] as const;

// ─── HomeContent ──────────────────────────────────────────────────────────────

const HomeContent = () => {
  const searchParams = useSearchParams();
  const [search, setSearch]               = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy]               = useState("Most popular");
  const [showFilters, setShowFilters]     = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const { data: allProducts = [], isLoading } = useProducts();

  // Filter
  const filtered = allProducts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.store_name ?? "").toLowerCase().includes(q);
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return Number(a.price) - Number(b.price);
    if (sortBy === "Price: High to Low") return Number(b.price) - Number(a.price);
    if (sortBy === "Newest")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  // Helpers
  const clearFilters = () => { setSearch(""); setSelectedCategory("All"); };

  const makeStoreSlug = (name?: string) =>
    name ? name.toLowerCase().replace(/\s+/g, "-") : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-28">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -m-20 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* Left: copy */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-5">
                <Sparkles size={13} className="text-accent" />
                <span>The new era of local commerce</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-foreground leading-[1.08] mb-5 text-balance">
                Buy and sell with{" "}
                <span className="relative inline-block text-primary">
                  people you trust
                  {/* Decorative underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-accent/40"
                    viewBox="0 0 200 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
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

              {/* Sub-copy */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-7 max-w-xl">
                Start selling online in minutes. Discover unique products from
                your neighbors, and shop securely with our 2-hour escrow
                guarantee.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/auth?tab=register&role=seller" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gradient-amber text-white font-semibold px-7 h-13 rounded-2xl shadow-amber hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-0"
                  >
                    Start your store <ArrowRight size={17} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-13 px-7 rounded-2xl border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all duration-300"
                  >
                    Explore marketplace
                  </Button>
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="font-medium text-foreground">100% Secure</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 flex-wrap">
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
                  <span className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    🌱 Early Access — Be a founding seller
                  </span>
                </div>
              </div>
            </div>

            {/* Right: image collage — hidden on mobile, visible ≥ lg */}
            <div className="relative h-[420px] lg:h-[540px] w-full hidden lg:block">
              {/* Background tilt card */}
              <div className="absolute inset-0 rounded-3xl bg-secondary transform rotate-3" />

              {/* Main image placeholder */}
              <div className="absolute top-4 left-4 right-12 bottom-12 rounded-3xl overflow-hidden shadow-xl border-4 border-card bg-secondary">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">Market Image</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Live</span>
                  </div>
                </div>
              </div>

              {/* Floating: seller thumbnail */}
              <div className="absolute -bottom-6 -left-6 h-44 w-36 rounded-2xl overflow-hidden shadow-xl border-4 border-card z-20 bg-secondary">
                <div className="w-full h-full bg-gradient-to-tr from-accent/20 to-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Seller</span>
                </div>
              </div>

              {/* Floating: fast delivery badge */}
              <div className="absolute top-10 -right-6 bg-card/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-border/50 z-30 animate-float flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Within 2 hours</p>
                </div>
              </div>

              {/* Floating: rating card */}
              <div
                className="absolute bottom-20 -right-2 bg-card p-3 rounded-2xl shadow-xl border border-border z-30 animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} className="fill-accent text-accent" />
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

      {/* ══ MAIN CONTENT AREA ═══════════════════════════════════════════════ */}
      <div className="container px-3 sm:px-4 md:px-6 pb-8 flex-1">

        {/* ── Mobile search bar ── */}
        <div className="md:hidden relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            className="w-full h-10 pl-9 pr-9 rounded-full border border-border bg-secondary/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            placeholder="Search products or stores…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Desktop search + sort controls ── */}
        <div className="hidden md:flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products or stores…"
              className="pl-10 h-11 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
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
              <SlidersHorizontal size={15} />
            </Button>
          </div>
        </div>

        {/* ── Category pills ── */}
        {/*
          Mobile: horizontal scroll row of icon + label pills.
          Desktop: wrapping flex row of text pills.
          No duplicate rendering — single element, Tailwind handles layout.
        */}
        <div className="mb-5 md:mb-8">
          {/* Mobile scrollable row */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
            {CATEGORIES.map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(label)}
                className={`flex flex-col items-center gap-1 shrink-0 snap-start`}
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center text-lg shadow-sm transition-all duration-200 ${
                    selectedCategory === label
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground border border-border hover:bg-primary/5"
                  }`}
                >
                  {emoji}
                </div>
                <span className="text-[10.5px] font-medium text-foreground leading-tight text-center max-w-[52px]">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Desktop wrapping pill row */}
          <div className="hidden md:flex flex-wrap gap-2">
            {CATEGORIES.map(({ label }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === label
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-primary/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Mobile action banners ── */}
        <div className="flex md:hidden flex-col gap-2 mb-5">
          <Link
            href="/home"
            className="flex items-center gap-3 bg-secondary/50 border border-border/50 p-3 rounded-2xl hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="text-sm">💡</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Learn how it works</p>
              <p className="text-xs text-muted-foreground">Discover the UbuntuNow platform</p>
            </div>
          </Link>
          <Link
            href="/auth?tab=register&intent=seller"
            className="flex items-center gap-3 bg-secondary/50 border border-border/50 p-3 rounded-2xl hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <span className="text-sm">🏪</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Start your store</p>
              <p className="text-xs text-muted-foreground">Sell your products to thousands</p>
            </div>
          </Link>
        </div>

        {/* ── Product results ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">Loading products…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">Try a different search or category</p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {/* Result count — desktop only */}
            <p className="hidden md:block text-sm text-muted-foreground mb-4">
              {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
            </p>

            {/*
              MOBILE: 2-column masonry via paired flex columns.
              Odd-indexed products go left, even-indexed go right, preserving the
              alternating aspect-ratio pattern across both columns together.
            */}
            <div className="md:hidden flex gap-1.5 items-start">
              {(["left", "right"] as const).map((side) => (
                <div key={side} className="flex-1 flex flex-col gap-1.5">
                  {sorted
                    .filter((_, i) => (side === "left" ? i % 2 === 0 : i % 2 !== 0))
                    .map((p, colIdx) => {
                      // Reconstruct original index to keep the aspect-ratio pattern global
                      const originalIdx = side === "left" ? colIdx * 2 : colIdx * 2 + 1;
                      const ratio = ASPECT_RATIO_PATTERN[originalIdx % 4];
                      return (
                        <ProductCard
                          key={p.id}
                          id={String(p.id)}
                          slug={p.slug || String(p.id)}
                          name={p.name}
                          price={Number(p.price)}
                          image={p.images?.[0]?.image}
                          storeName={p.store_name}
                          storeSlug={makeStoreSlug(p.store_name)}
                          category={p.category}
                          inStock={p.stock_quantity > 0}
                          sellerHasStock={(p as any).in_stock}
                          aspectRatio={ratio}
                        />
                      );
                    })}
                </div>
              ))}
            </div>

            {/*
              DESKTOP: CSS masonry columns (3 → 4 → 5 cols).
              break-inside-avoid prevents cards from splitting across columns.
            */}
            <div className="hidden md:block columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
              {sorted.map((product, i) => {
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
                      storeSlug={makeStoreSlug(product.store_name)}
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

      {/* Footer — visible on all breakpoints now */}
      <Footer />
    </div>
  );
};

// ─── Page export ──────────────────────────────────────────────────────────────

const Home = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    }
  >
    <HomeContent />
  </Suspense>
);

export default Home;