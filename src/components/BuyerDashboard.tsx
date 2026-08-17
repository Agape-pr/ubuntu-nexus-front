"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard, { ProductGrid } from "@/components/ProductCard";
import { AutoSlideCarousel } from "@/components/AutoSlideCarousel";
import { PromoBanner, type PromoSlide } from "@/components/PromoBanner";
import { useProducts } from "@/lib/api/hooks/useProducts";
import { useBuyerOrders } from "@/lib/api/hooks/useOrders";
import type { Order, OrderItem } from "@/lib/api/services/orders";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";
import { useCartStore } from "@/lib/store/cartStore";
import { resolveCategoryName } from "@/lib/categories";
import {
  Store, ShoppingBag, ShoppingCart, User, ChevronRight,
  Search, SlidersHorizontal, X, Sparkles, Lock,
  AlertTriangle, RotateCcw, PackageSearch, ArrowRight, Clock, CheckCircle, Truck, Package,
} from "lucide-react";

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

// Rotating accent palette so the category strip reads as vibrant, not uniform grey
const CATEGORY_COLORS = [
  { bg: "bg-primary/10",      text: "text-primary" },
  { bg: "bg-emerald-500/10",  text: "text-emerald-500" },
  { bg: "bg-sky-500/10",      text: "text-sky-400" },
  { bg: "bg-violet-500/10",   text: "text-violet-400" },
  { bg: "bg-rose-500/10",     text: "text-rose-400" },
  { bg: "bg-amber-500/10",    text: "text-amber-400" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

interface PriceBucket {
  label: string;
  min?: number;
  max?: number;
}

const PRICE_BUCKETS: PriceBucket[] = [
  { label: "Under 10,000", max: 10_000 },
  { label: "10,000 – 30,000", min: 10_000, max: 30_000 },
  { label: "Over 30,000", min: 30_000 },
];

const PROMO_SLIDES: PromoSlide[] = [
  {
    key: "new-arrivals",
    href: "#new-arrivals",
    icon: Package,
    title: "New drops every week",
    subtitle: "New arrivals from local sellers",
    cta: "Browse",
    className: "bg-gradient-to-r from-primary/15 to-accent/5 border-primary/20",
    iconClassName: "text-primary",
  },
  {
    key: "trusted-sellers",
    href: "#trusted-sellers",
    icon: Store,
    title: "Shop trusted local sellers",
    subtitle: "Verified stores across Rwanda",
    cta: "Explore",
    className: "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border-emerald-500/20",
    iconClassName: "text-emerald-400",
  },
  {
    key: "escrow",
    icon: Lock,
    title: "Escrow-protected payments",
    subtitle: "Your money is held safe until delivery",
    className: "bg-gradient-to-r from-sky-500/15 to-sky-500/5 border-sky-500/20",
    iconClassName: "text-sky-400",
  },
  {
    key: "delivery",
    href: "/my-orders",
    icon: Truck,
    title: "Same-day delivery in Kigali",
    subtitle: "Track every order in real time",
    cta: "My orders",
    className: "bg-gradient-to-r from-violet-500/15 to-violet-500/5 border-violet-500/20",
    iconClassName: "text-violet-400",
  },
];

const makeStoreSlug = (name?: string) =>
  name ? name.toLowerCase().trim().replace(/\s+/g, "-") : undefined;

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  pending:          { label: "Order placed",  color: "bg-secondary text-muted-foreground border border-border", step: 1 },
  confirmed:        { label: "Confirmed",     color: "bg-secondary text-muted-foreground border border-border", step: 1 },
  shipped:          { label: "Ready to ship", color: "bg-amber-500/10 text-amber-700 border border-amber-500/20", step: 2 },
  ready_to_ship:    { label: "Ready to ship", color: "bg-amber-500/10 text-amber-700 border border-amber-500/20", step: 2 },
  picked:           { label: "On its way",    color: "bg-sky-500/10 text-sky-700 border border-sky-500/20", step: 3 },
  out_for_delivery: { label: "On its way",    color: "bg-sky-500/10 text-sky-700 border border-sky-500/20", step: 3 },
  ready_for_pickup: { label: "On its way",    color: "bg-sky-500/10 text-sky-700 border border-sky-500/20", step: 3 },
  in_transit:       { label: "On its way",    color: "bg-sky-500/10 text-sky-700 border border-sky-500/20", step: 3 },
  completed:        { label: "Delivered",     color: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20", step: 4 },
};

function getOrderStatus(status: string) {
  return ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP[(status || "").toLowerCase()] || ORDER_STATUS_MAP.pending;
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card border border-border/80 rounded-xl overflow-hidden">
      <div className="aspect-[4/3] bg-secondary animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-secondary rounded animate-pulse" />
        <div className="h-3.5 w-2/3 bg-secondary rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-secondary rounded animate-pulse mt-3" />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: IconType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-foreground text-base mb-1">{title}</h3>
      <p className="text-muted-foreground text-xs max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}

export function BuyerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "shop" || searchParams.get("search") ? "shop" : "overview";
  const goToShop = () => router.push("/dashboard?view=shop");

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceBucket, setPriceBucket] = useState<string | null>(null);

  const { data: userProfile } = useCurrentUser();
  const { data: allProducts = [], isLoading, isError, refetch } = useProducts();
  const { data: ordersData, isLoading: isOrdersLoading } = useBuyerOrders();
  const orders = ordersData || [];
  const cartCount = useCartStore((s) => s.getTotalItems());

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    allProducts.forEach((p) => {
      const name = resolveCategoryName(p.category);
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProducts]);

  const stores = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; count: number }>();
    allProducts.forEach((p: any) => {
      const sName = p.store_name || (typeof p.store === "object" ? p.store?.store_name : null);
      const sId = typeof p.store === "number" ? p.store : typeof p.store === "object" ? p.store?.id : p.store_id;
      const name = sName || (sId ? `Store #${sId}` : null);
      if (!name) return;
      const slug = makeStoreSlug(name) || (sId ? `store-${sId}` : null);
      if (!slug) return;
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { name, slug, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return [...allProducts]
      .filter((p) => Number(p.stock_quantity) > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [allProducts]);

  const priceRange = PRICE_BUCKETS.find((b) => b.label === priceBucket);

  const filtered = allProducts.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.store_name ?? "").toLowerCase().includes(q);
    const matchCategory = selectedCategory === "All" || resolveCategoryName(p.category) === selectedCategory;
    const matchStock = !inStockOnly || Number(p.stock_quantity) > 0;
    const price = Number(p.price);
    const matchPrice =
      !priceRange ||
      ((priceRange.min === undefined || price >= priceRange.min) &&
        (priceRange.max === undefined || price < priceRange.max));
    return matchSearch && matchCategory && matchStock && matchPrice;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
    if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeFilterCount = [inStockOnly, !!priceRange].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setInStockOnly(false);
    setPriceBucket(null);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = userProfile?.first_name || "there";
  const pendingOrders = orders.filter((o: Order) => getOrderStatus(o.status).step < 4).length;
  const deliveredOrders = orders.filter((o: Order) => getOrderStatus(o.status).step === 4).length;
  const totalSpent = orders.reduce((sum: number, o: Order) => sum + (parseFloat(o?.total_amount) || 0), 0);

  const STATS = [
    { label: "Total Orders", value: isOrdersLoading ? "…" : String(orders.length), sub: pendingOrders > 0 ? `${pendingOrders} in progress` : "All delivered", icon: ShoppingBag },
    { label: "Delivered", value: isOrdersLoading ? "…" : String(deliveredOrders), sub: "Completed orders", icon: CheckCircle },
    { label: "In Cart", value: String(cartCount), sub: cartCount > 0 ? "Ready for checkout" : "Cart is empty", icon: ShoppingCart },
    { label: "Total Spent", value: totalSpent > 0 ? totalSpent.toLocaleString() : "0", sub: "RWF", icon: Truck },
  ];

  return (
    <BuyerDashboardShell>
      <div className="p-4 md:p-6 lg:p-8">
        {view === "overview" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Account Overview
                </h1>
              </div>
              <Button
                onClick={goToShop}
                className="gap-2 rounded-lg text-sm font-semibold shrink-0"
              >
                <Store size={15} /> Browse Marketplace
              </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl p-4 border border-border/80 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                    <stat.icon size={16} className="opacity-70" />
                  </div>
                  <div className="text-2xl font-bold text-foreground tracking-tight mb-0.5">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-xl border border-border/80 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-muted-foreground" />
                  <h2 className="font-semibold text-foreground text-sm">Recent Orders</h2>
                  {orders.length > 0 && <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{orders.length}</span>}
                </div>
                <Link href="/my-orders" className="text-xs font-medium text-primary hover:underline flex items-center gap-1 transition-colors">
                  View all <ChevronRight size={12} />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="px-6 py-12 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-3 text-muted-foreground">
                    <ShoppingBag size={20} />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">No orders placed yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">When you place orders on the marketplace, they will appear here for tracking.</p>
                  <Button onClick={goToShop} variant="outline" className="mt-4 rounded-lg text-xs font-semibold gap-2">
                    <Store size={13} /> Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {orders.slice(0, 5).map((order: Order) => {
                    const s = getOrderStatus(order.status);
                    return (
                      <Link key={order.id} href="/my-orders" className="px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/40 transition-colors">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-secondary border border-border/60 text-muted-foreground">
                          {s.step === 4 ? (
                            <CheckCircle size={16} className="text-emerald-600" />
                          ) : s.step === 3 ? (
                            <Truck size={16} className="text-sky-600" />
                          ) : (
                            <Package size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-foreground">Order #{order.id}</span>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {order.items?.map((i: OrderItem) => i.product_name).join(", ")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm text-foreground">
                            {parseFloat(order.total_amount).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">RWF</span>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${s.color}`}>{s.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/my-orders" className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Track Orders</p>
                  <p className="text-xs text-muted-foreground">Real-time status</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground ml-auto shrink-0" />
              </Link>
              <Link href="/cart" className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                  <ShoppingCart size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">View Cart</p>
                  <p className="text-xs text-muted-foreground">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground ml-auto shrink-0" />
              </Link>
              <Link href="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Account Settings</p>
                  <p className="text-xs text-muted-foreground">Address & profile</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground ml-auto shrink-0" />
              </Link>
            </div>
          </div>
        )}

        {view === "shop" && (
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
            {/* Search */}
            <form onSubmit={(e) => e.preventDefault()} role="search" className="relative max-w-xl">
              <label htmlFor="dash-search" className="sr-only">Search products or stores</label>
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                id="dash-search"
                className="w-full h-11 md:h-12 pl-11 pr-11 rounded-xl border border-border bg-card text-[15px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-foreground placeholder:text-muted-foreground transition-shadow"
                placeholder="Search for products, categories, or stores…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={15} />
                </button>
              )}
            </form>

            {/* Category tabs */}
            {categories.length > 0 && (
              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar border-b border-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={`relative shrink-0 pb-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === "All" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                  {selectedCategory === "All" && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </button>
                {categories.map(({ name }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedCategory(name)}
                    className={`relative shrink-0 pb-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === name ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {name}
                    {selectedCategory === name && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Promo banner — auto-rotates every few seconds */}
            <PromoBanner slides={PROMO_SLIDES} intervalMs={6000} />

            {/* New arrivals — small auto-sliding carousel */}
            {!isLoading && !isError && newArrivals.length >= 4 && selectedCategory === "All" && !search && (
              <section id="new-arrivals" className="scroll-mt-20">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="flex items-center gap-2 text-base md:text-lg font-bold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-accent" /> New arrivals
                  </h2>
                  <span className="hidden sm:inline text-xs text-muted-foreground">Freshly listed by sellers</span>
                </div>
                <AutoSlideCarousel
                  items={newArrivals}
                  itemKey={(product) => product.id}
                  renderItem={(product) => (
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
                      showAddToCart={false}
                      hideName={true}
                      hideWishlist={true}
                    />
                  )}
                />
              </section>
            )}



            {/* Browse */}
            <section id="browse">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-base md:text-lg font-bold text-foreground">
                  {search || selectedCategory !== "All" ? "Results" : "All products"}
                </h2>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10 w-[150px] sm:w-44 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Toggle filters"
                    aria-expanded={showFilters}
                    className="h-10 w-10 rounded-xl relative shrink-0"
                    onClick={() => setShowFilters((v) => !v)}
                  >
                    <SlidersHorizontal size={16} />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-accent text-[9px] font-bold text-near-black flex items-center justify-center px-1">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="mb-5 p-4 rounded-2xl border border-border/60 bg-secondary/40 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    In stock only
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground mr-1">Price:</span>
                    {PRICE_BUCKETS.map((bucket) => (
                      <button
                        key={bucket.label}
                        onClick={() => setPriceBucket((v) => (v === bucket.label ? null : bucket.label))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          priceBucket === bucket.label
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {bucket.label} RWF
                      </button>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setSelectedCategory("All"); setInStockOnly(false); setPriceBucket(null); }}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Couldn't load products"
                  description="Something went wrong while fetching the marketplace. Check your connection and try again."
                  action={
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={() => refetch()}>
                      <RotateCcw size={15} /> Try again
                    </Button>
                  }
                />
              ) : sorted.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title={allProducts.length === 0 ? "No products yet" : "No products found"}
                  description={
                    allProducts.length === 0
                      ? "Sellers are just getting started — check back soon for new listings."
                      : "Try a different search term, category, or clear your filters."
                  }
                  action={
                    allProducts.length > 0 ? (
                      <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
                  </p>
                  <ProductGrid
                    products={sorted.map((product) => ({
                      id: String(product.id),
                      slug: product.slug || String(product.id),
                      name: product.name,
                      price: Number(product.price),
                      image: product.images?.[0]?.image,
                      storeName: product.store_name,
                      storeSlug: makeStoreSlug(product.store_name),
                      category: product.category,
                      inStock: product.stock_quantity > 0,
                      stockQuantity: product.stock_quantity,
                      sellerHasStock: (product as { in_stock?: boolean }).in_stock,
                    }))}
                  />
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </BuyerDashboardShell>
  );
}
