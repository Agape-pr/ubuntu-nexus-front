"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store, Package, TrendingUp, Settings, Plus, Copy, ExternalLink,
  CheckCircle, Edit3, Trash2, ShoppingBag, AlertCircle, Loader2,
  Eye, LayoutDashboard, Wallet, LogOut, ChevronRight, ChevronDown, Search,
  Tag, X, ImagePlus, ArrowRight, Sparkles, BarChart2, Star, Truck, Bell, Link2,
  ArrowLeft, User, MapPin, Mail, Phone, Lock, ImageOff, SlidersHorizontal, Filter, Zap,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, useSellerProducts, useDeleteProduct } from "@/lib/api/hooks/useProducts";
import { useSellerOrders, useUpdateOrderStatus } from "@/lib/api/hooks/useOrders";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { useCurrentUser, useUpdateStore, useUpdateProfile } from "@/lib/api/hooks/useUsers";
import { toast } from "sonner";
import { CloudImage } from "@/components/ui/CloudImage";
import { BuyerDashboard } from "@/components/BuyerDashboard";
import { resolveCategoryName } from "@/lib/categories";

type DashView = "overview" | "products" | "orders" | "settings" | "profile-settings" | "store-settings";
const SETTINGS_VIEWS: DashView[] = ["settings", "profile-settings", "store-settings"];

const PRODUCT_CATEGORIES = [
  "Clothing & Fashion",
  "Electronics & Gadgets",
  "Beauty & Personal Care",
  "Bags & Accessories",
  "Home & Living",
  "Jewelry",
  "Books",
  "Other"
];

// Pipeline steps
const ORDER_STEPS = [
  { key: "pending",   step: 1, label: "New Order",          short: "New",         apiStatus: "pending"   },
  { key: "shipped",  step: 2, label: "Ready to Ship",      short: "Shipping",    apiStatus: "shipped"   },
  { key: "picked",   step: 3, label: "Picked by Delivery", short: "On the way",  apiStatus: "picked"    },
  { key: "completed",step: 4, label: "Completed",          short: "Done",        apiStatus: "completed" },
];

function getOrderStep(status: string): number {
  const s = (status || "").toLowerCase();
  if (s === "completed") return 4;
  if (s === "picked" || s === "out_for_delivery" || s === "in_transit" || s === "ready_for_pickup") return 3;
  if (s === "shipped" || s === "ready_to_ship") return 2;
  return 1; // pending
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  pending:          { color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",        dot: "bg-amber-400",   label: "New Order" },
  confirmed:        { color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",        dot: "bg-amber-400",   label: "New Order" },
  PENDING:          { color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",        dot: "bg-amber-400",   label: "New Order" },
  shipped:          { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  ready_to_ship:    { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  SHIPPED:          { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  picked:           { color: "bg-sky-500/20 text-sky-300 border border-sky-500/30",            dot: "bg-sky-400",     label: "Picked by Delivery" },
  out_for_delivery: { color: "bg-sky-500/20 text-sky-300 border border-sky-500/30",            dot: "bg-sky-400",     label: "Picked by Delivery" },
  ready_for_pickup: { color: "bg-sky-500/20 text-sky-300 border border-sky-500/30",            dot: "bg-sky-400",     label: "Picked by Delivery" },
  in_transit:       { color: "bg-sky-500/20 text-sky-300 border border-sky-500/30",            dot: "bg-sky-400",     label: "Picked by Delivery" },
  completed:        { color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400", label: "Completed" },
  COMPLETED:        { color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400", label: "Completed" },
  "out-of-stock":   { color: "bg-rose-500/20 text-rose-400 border border-rose-500/30",        dot: "bg-rose-400",   label: "Out of stock" },
  active:           { color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400", label: "Active" },
};

// -- OrderCard Component --
function OrderCard({ order, s, step, itemCount, updateStatus, isUpdatingOrder }: {
  order: any;
  s: { color: string; dot: string; label: string };
  step: number;
  itemCount: number;
  updateStatus: (args: { id: number; status: string }) => void;
  isUpdatingOrder: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const stepDefs = [
    { n: 1, label: "New Order",          sub: "Placed by buyer" },
    { n: 2, label: "Ready to Ship",      sub: "Packed by seller" },
    { n: 3, label: "Picked by Delivery", sub: "On the way" },
    { n: 4, label: "Completed",          sub: "Delivered & paid" },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-border">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Package size={20} className="text-white/60" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-white tracking-tight">Order #{order.id}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${s.color}`}>
              {s.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{new Date(order.created_at).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span>{new Date(order.created_at).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-black text-white text-base leading-none mb-1">
            {parseFloat(order.total_amount).toLocaleString()} <span className="text-xs font-bold text-muted-foreground">RWF</span>
          </div>
          <span className="text-xs text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
        </div>

        <ChevronDown
          size={18}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/60 bg-background/30">
          {/* Stepper Timeline */}
          <div className="pt-4">
            <div className="flex items-start justify-between gap-1 relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10 z-0" />

              {stepDefs.map((sd) => {
                const isDone    = step > sd.n;
                const isCurrent = step === sd.n;
                const isFuture  = step < sd.n;

                const circleClass = isDone
                  ? "bg-emerald-500 text-slate-950 border-emerald-500"
                  : isCurrent
                  ? "bg-gold-accent text-slate-950 border-gold-accent shadow-md shadow-gold-accent/20"
                  : "bg-card text-muted-foreground border-border";

                return (
                  <button
                    key={sd.n}
                    disabled={isFuture}
                    onClick={() => {
                      if (sd.n === 2 && order.status === "pending") {
                        updateStatus({ id: order.id, status: "shipped" });
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 z-10 relative flex-1 group ${isFuture ? "cursor-default opacity-50" : "cursor-pointer"}`}
                  >
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all ${circleClass} ${!isFuture ? "group-hover:scale-110" : ""}`}>
                      {isDone ? <CheckCircle size={14} /> : sd.n}
                    </div>
                    <div className="text-center">
                      <div className={`text-[10px] font-bold leading-tight ${isCurrent ? "text-gold-accent" : isDone ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {sd.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Items Ordered</p>
            <div className="bg-card rounded-xl border border-border/80 divide-y divide-border/60 overflow-hidden">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selected_variations).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-medium">
                            {k}: {v as string}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white shrink-0">
                    {parseFloat(item.total_price || item.price || "0").toLocaleString()} <span className="text-xs font-normal text-muted-foreground">RWF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Action Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-emerald-400" />
              <span className={`text-xs font-bold ${order.status === "completed" ? "text-emerald-400" : "text-gold-accent"}`}>
                {order.status === "completed" ? "Payment Released to Seller" : "Escrow Protected Payment"}
              </span>
            </div>

            {order.status === "pending" && (
              <button
                onClick={() => updateStatus({ id: order.id, status: "shipped" })}
                disabled={isUpdatingOrder}
                className="px-5 py-2.5 rounded-xl bg-gold-accent text-slate-950 font-bold text-xs hover:bg-accent transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Truck size={14} /> Mark Ready to Ship
              </button>
            )}
            {order.status === "shipped" && (
              <button
                onClick={() => updateStatus({ id: order.id, status: "picked" })}
                disabled={isUpdatingOrder}
                className="px-5 py-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-xs hover:bg-sky-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Package size={14} /> Mark Picked by Delivery
              </button>
            )}
            {order.status === "picked" && (
              <button
                onClick={() => updateStatus({ id: order.id, status: "completed" })}
                disabled={isUpdatingOrder}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={14} /> Mark Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -- Main Seller Dashboard View --
function SellerDashboardView() {
  const [view, setView] = useState<DashView>("overview");
  const [copied, setCopied] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);

  // Filters for Products view
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");

  const { data: userProfile, isLoading: isUserLoading } = useCurrentUser();
  const { data: sellerProducts, isLoading: isProductsLoading } = useSellerProducts();
  const { data: realOrdersData, isLoading: isOrdersLoading } = useSellerOrders();
  const { mutate: updateStatus, isPending: isUpdatingOrder } = useUpdateOrderStatus();
  const REAL_ORDERS = realOrdersData || [];

  const [productForm, setProductForm] = useState({
    name: "", price: "", stock_quantity: "", category: "", description: "",
    in_stock: null as boolean | null,
    variations: [] as { name: string, options: string }[],
  });
  const [storeForm, setStoreForm] = useState({ name: "", description: "" });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", phone_number: "",
    address_line1: "", address_line2: "", city: "", country: "Rwanda",
  });
  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateStoreMutation = useUpdateStore();
  const updateProfileMutation = useUpdateProfile();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (userProfile?.store) {
      setStoreForm({
        name: userProfile.store.store_name || "",
        description: userProfile.store.store_description || "",
      });
    }
    if (userProfile) {
      setProfileForm({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        address_line1: userProfile.address_line1 || "",
        address_line2: userProfile.address_line2 || "",
        city: userProfile.city || "",
        country: userProfile.country || "Rwanda",
      });
    }
  }, [userProfile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      phone_number: profileForm.phone_number,
      address_line1: profileForm.address_line1,
      address_line2: profileForm.address_line2,
      city: profileForm.city,
      country: profileForm.country,
    });
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setProductImages(arr);
    setProductImagePreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const handleLogoChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Logo must be less than 10MB"); return; }
    setStoreLogoFile(file);
    setStoreLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveStoreSettings = () => {
    if (!storeForm.name.trim()) return toast.error("Store name is required.");
    updateStoreMutation.mutate({
      store_name: storeForm.name.trim(),
      store_description: storeForm.description.trim() || undefined,
      ...(storeLogoFile && { store_logo: storeLogoFile }),
    }, {
      onSuccess: () => {
        setStoreLogoFile(null);
        setStoreLogoPreview(null);
        toast.success("Store updated successfully!");
      },
    });
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock_quantity || !productForm.category) {
      return toast.error("Please fill in all required fields.");
    }
    if (productForm.in_stock === null) {
      return toast.error("Please answer: do you currently have this item in stock?");
    }

    setIsSavingProduct(true);
    try {
      const formattedVariations: Record<string, string[]> = {};
      productForm.variations.forEach(v => {
        if (v.name.trim() && v.options.trim()) {
          formattedVariations[v.name.trim()] = v.options.split(',').map(o => o.trim()).filter(Boolean);
        }
      });

      const payload: any = {
        name: productForm.name,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity),
        category: productForm.category,
        description: productForm.description,
        is_active: true,
        in_stock: productForm.in_stock,
        uploaded_images: productImages.length > 0 ? productImages : undefined,
        variations: Object.keys(formattedVariations).length > 0 ? formattedVariations : undefined,
      };

      const opts = {
        onSuccess: () => {
          setShowAddProduct(false);
          setEditingProductId(null);
          setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "", in_stock: null, variations: [] });
          setProductImages([]);
          setProductImagePreviews([]);
          setIsSavingProduct(false);
          toast.success(editingProductId ? "Product updated!" : "Product listed successfully!");
        },
        onError: (error: any) => {
          setIsSavingProduct(false);
          toast.error(error.message || "Failed to save product.");
        }
      };

      if (editingProductId) {
        updateProductMutation.mutate({ id: editingProductId, data: payload }, opts);
      } else {
        createProductMutation.mutate(payload, opts);
      }
    } catch (e: any) {
      setIsSavingProduct(false);
      toast.error(e.message || "Failed to save product. Please try again.");
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id.toString());
    const existingVariations: {name: string, options: string}[] = [];
    if (product.variations) {
      for (const [k, v] of Object.entries(product.variations)) {
        existingVariations.push({ name: k, options: (v as string[]).join(", ") });
      }
    }

    setProductForm({
      name: product.name, price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category.toString(),
      description: product.description || "",
      in_stock: typeof product.in_stock === 'boolean' ? product.in_stock : null,
      variations: existingVariations,
    });
    setProductImages([]);
    setProductImagePreviews([]);
    setShowAddProduct(true);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const storeName = userProfile?.store?.store_name || "My Store";
  const storeSlug = userProfile?.store?.slug || "";
  const storeUrl = storeSlug ? `/shop/${storeSlug}` : null;
  const storeUrlDisplay = storeSlug
    ? `www.ubuntunow.rw/shop/${storeSlug}`
    : isUserLoading
    ? "Loading your store link…"
    : "www.ubuntunow.rw/shop/your-store";
  const storeInitials = storeName.substring(0, 2).toUpperCase();
  const activeProductsCount = sellerProducts?.filter(p => p.is_active).length || 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const navItems = [
    { id: "overview" as DashView, label: "Overview", icon: LayoutDashboard },
    { id: "products" as DashView, label: "My Products", icon: Package },
    { id: "orders" as DashView, label: "Orders", icon: ShoppingBag },
    { id: "settings" as DashView, label: "Settings", icon: Settings },
  ];
  const isNavItemActive = (itemId: DashView) =>
    itemId === "settings" ? SETTINGS_VIEWS.includes(view) : view === itemId;

  const totalRevenue = REAL_ORDERS.reduce((sum: number, order: any) => sum + (parseFloat(order?.total_amount) || 0), 0);
  const pendingOrders = REAL_ORDERS.filter((o: any) => o.status === "pending").length;

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    if (!sellerProducts) return [];
    return sellerProducts.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase().trim()) ||
        (p.description || "").toLowerCase().includes(productSearch.toLowerCase().trim());
      const matchCat =
        selectedCategoryFilter === "All" ||
        resolveCategoryName(p.category) === selectedCategoryFilter;
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.stock_quantity > 0) ||
        (stockFilter === "out_of_stock" && p.stock_quantity === 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [sellerProducts, productSearch, selectedCategoryFilter, stockFilter]);

  const STATS = [
    { label: "Active Listings", value: isProductsLoading ? "…" : String(activeProductsCount), sub: "Live in store", icon: Package, iconBg: "bg-blue-500/15 border-blue-500/25", iconColor: "text-blue-400" },
    { label: "Total Orders", value: String(REAL_ORDERS.length), sub: pendingOrders > 0 ? `${pendingOrders} action needed` : "All fulfilled", icon: ShoppingBag, iconBg: "bg-gold-bright/15 border-gold-bright/25", iconColor: "text-gold-accent" },
    { label: "Revenue Earned", value: totalRevenue > 0 ? `${totalRevenue.toLocaleString()}` : "0", sub: totalRevenue > 0 ? "RWF · Escrow protected" : "Start selling today", icon: Wallet, iconBg: "bg-emerald-500/15 border-emerald-500/25", iconColor: "text-emerald-400" },
    { label: "Store Status", value: storeSlug ? "Live" : "Setup", sub: storeSlug ? "Accepting orders" : "Complete your store", icon: Zap, iconBg: "bg-violet-500/15 border-violet-500/25", iconColor: "text-violet-400" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar (desktop) */}
      <div className="hidden lg:block sticky top-0 z-50 w-full">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {/* -- Sidebar ---------------------------------- */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-card/50 border-r border-border sticky top-16 h-[calc(100vh-64px)]">
          {/* Store identity */}
          <div className="p-5 border-b border-border/80">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {storeLogoPreview ? (
                    <img src={storeLogoPreview} alt={storeName} className="w-full h-full object-cover" />
                  ) : (
                    <CloudImage
                      publicId={userProfile?.store?.store_logo || ""}
                      alt={storeName}
                      width={48}
                      height={48}
                      crop="fill"
                      className="w-full h-full object-cover"
                      fallback={<span className="text-white font-bold text-sm">{storeInitials}</span>}
                    />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm truncate">{isUserLoading ? "Loading..." : storeName}</div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Seller
                </div>
              </div>
            </div>

            {/* Store link pill */}
            {storeUrl ? (
              <Link href={storeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group">
                <ExternalLink size={12} className="text-muted-foreground group-hover:text-white shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate flex-1">{storeUrlDisplay}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed">
                {isUserLoading ? <Loader2 size={12} className="animate-spin text-muted-foreground shrink-0" /> : <ExternalLink size={12} className="text-muted-foreground shrink-0" />}
                <span className="text-[11px] text-muted-foreground truncate flex-1">{storeUrlDisplay}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const isActive = isNavItemActive(item.id);
              const badgeCount = item.id === "orders" ? pendingOrders : item.id === "products" ? activeProductsCount : 0;
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}>
                  <item.icon size={17} className={isActive ? "text-primary-foreground" : ""} />
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-gold-bright/20 text-gold-accent border border-gold-bright/30"
                    }`}>
                      {badgeCount}
                    </span>
                  )}
                  {isActive && badgeCount === 0 && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Store Actions */}
          <div className="p-4 border-t border-border/80 space-y-2">
            {storeUrl ? (
              <Button asChild variant="outline" className="w-full rounded-xl h-10 text-xs font-semibold gap-2 border-border hover:bg-white/5 text-white">
                <Link href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <Eye size={14} /> Preview Store
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full rounded-xl h-10 text-xs font-semibold gap-2 border-border bg-white/5 text-muted-foreground opacity-60">
                {isUserLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                {isUserLoading ? "Loading store…" : "Preview unavailable"}
              </Button>
            )}
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* -- Main content area ----------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-10">

          {/* -- OVERVIEW VIEW ------------------------------- */}
          {view === "overview" && (
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Greeting Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 border border-border/80 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
                <div>
                  <p className="text-xs font-bold text-gold-accent tracking-wider uppercase mb-1">{getGreeting()}, {storeName}</p>
                  <h1 className="font-display text-2xl md:text-3xl text-white tracking-tight leading-tight">
                    Here's your seller dashboard
                  </h1>
                  {pendingOrders > 0 ? (
                    <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full w-fit">
                      <Bell size={13} className="animate-pulse" />
                      {pendingOrders} order{pendingOrders > 1 ? 's' : ''} waiting for pack & ship
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Everything is up to date and active.</p>
                  )}
                </div>
                <Button onClick={() => { setView("products"); setShowAddProduct(true); }}
                  className="bg-gold-accent text-slate-950 hover:bg-accent rounded-xl px-5 h-11 gap-2 font-bold shadow-md hover:-translate-y-0.5 transition-all shrink-0">
                  <Plus size={16} /> List a Product
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {STATS.map(stat => (
                  <div key={stat.label} className="bg-card rounded-2xl p-4 md:p-5 border border-border/80 hover:border-border transition-all shadow-sm">
                    <div className={`h-10 w-10 rounded-xl border ${stat.iconBg} flex items-center justify-center mb-3`}>
                      <stat.icon size={18} className={stat.iconColor} />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-white leading-none mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-white/80">{stat.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 truncate">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Share Store Card */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-5 md:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Store Link Ready</span>
                    </div>
                    <p className="font-mono text-sm md:text-base text-white truncate font-medium">{storeUrlDisplay}</p>
                    <p className="text-xs text-muted-foreground">Share on WhatsApp, Instagram, or Facebook to get orders instantly.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        if (!storeSlug) return;
                        navigator.clipboard.writeText(`${window.location.origin}/shop/${storeSlug}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        toast.success("Store link copied!");
                      }}
                      disabled={!storeSlug}
                      className="bg-gold-accent text-slate-950 hover:bg-accent rounded-xl font-bold gap-2 h-10 px-4 text-xs shadow-sm">
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy link"}
                    </Button>
                    {storeUrl && (
                      <Button asChild variant="outline" className="rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/10 h-10 px-4 text-xs gap-1.5">
                        <Link href={storeUrl} target="_blank" rel="noopener noreferrer">
                          <Eye size={14} /> Preview
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-gold-accent" />
                    <h2 className="font-bold text-white text-sm">Recent Sales</h2>
                    {REAL_ORDERS.length > 0 && (
                      <span className="text-xs font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">
                        {REAL_ORDERS.length}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setView("orders")} className="text-xs font-semibold text-gold-accent hover:text-accent flex items-center gap-1 transition-colors">
                    View all orders <ChevronRight size={13} />
                  </button>
                </div>

                {REAL_ORDERS.length === 0 ? (
                  <div className="px-6 py-12 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <ShoppingBag size={24} className="text-white/30" />
                    </div>
                    <p className="font-bold text-white mb-1">No orders yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Share your store link on WhatsApp & Instagram to get your first customer order.
                    </p>
                    {storeUrl && (
                      <button onClick={() => { if (storeSlug) navigator.clipboard.writeText(`${window.location.origin}/shop/${storeSlug}`); toast.success("Store link copied!"); }}
                        className="mt-4 flex items-center gap-2 text-xs font-bold text-gold-accent hover:text-accent transition-colors">
                        <Copy size={13} /> Copy store link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {REAL_ORDERS.slice(0, 5).map((order: any) => {
                      const s = statusConfig[order.status] || statusConfig.pending;
                      const isPending = order.status === "pending";
                      return (
                        <div key={order.id} className={`px-5 py-4 flex items-center gap-4 transition-colors ${ isPending ? "bg-amber-500/5" : "hover:bg-white/5" }`}>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            order.status === "completed" ? "bg-emerald-500/15" :
                            order.status === "shipped" ? "bg-gold-bright/15" : "bg-amber-500/15"
                          }`}>
                            {order.status === "completed" ? (
                              <CheckCircle size={17} className="text-emerald-400" />
                            ) : order.status === "shipped" ? (
                              <Truck size={17} className="text-gold-accent" />
                            ) : (
                              <Package size={17} className="text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">Order #{order.id}</span>
                              {isPending && <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">Action needed</span>}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{order.items?.map((i: any) => i.product_name).join(', ')}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-sm text-white">{parseFloat(order.total_amount).toLocaleString()} <span className="text-[10px] font-bold text-muted-foreground">RWF</span></div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s?.color || 'bg-white/10 text-white/60'}`}>{order.status?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* -- PRODUCTS VIEW ------------------------------- */}
          {view === "products" && (
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {showAddProduct
                      ? (editingProductId ? `Edit Product` : "List a New Product")
                      : `My Products (${sellerProducts?.length || 0})`}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {showAddProduct ? "Fill in details to publish to your Rwanda store." : "Manage listings, pricing, and stock status."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {showAddProduct ? (
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="gap-1.5 text-muted-foreground hover:text-white rounded-xl">
                      <X size={15} /> Cancel
                    </Button>
                  ) : (
                    <Button onClick={() => { setEditingProductId(null); setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "", in_stock: null, variations: [] }); setProductImages([]); setProductImagePreviews([]); setShowAddProduct(true); }}
                      className="bg-gold-accent text-slate-950 hover:bg-accent rounded-xl px-5 h-11 gap-2 font-bold shadow-sm">
                      <Plus size={16} /> Add Product
                    </Button>
                  )}
                </div>
              </div>

              {/* Add / Edit Form */}
              {showAddProduct && (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {editingProductId
                        ? <><Edit3 size={18} className="text-gold-accent"/> Edit Listing</>
                        : <><Plus size={18} className="text-gold-accent"/> New Product Listing</>}
                    </h2>
                    <button onClick={() => { setShowAddProduct(false); setEditingProductId(null); }} className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <X size={15} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-accent border-b border-border/60 pb-2">Basic Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Product Name *</Label>
                          <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Premium Ankara Dress" className="rounded-xl h-11 border-border bg-background text-white" />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Category *</Label>
                          <Select value={productForm.category} onValueChange={(val) => setProductForm({ ...productForm, category: val })}>
                            <SelectTrigger className="rounded-xl h-11 border-border bg-background text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Description</Label>
                          <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Describe item features, materials, sizing, origin…"
                            className="rounded-xl border-border bg-background text-white resize-none" rows={3} />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-accent border-b border-border/60 pb-2">Pricing & Inventory</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Price (RWF) *</Label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">RWF</span>
                            <Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="25,000" className="rounded-xl h-11 border-border bg-background text-white pl-12" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-muted-foreground">Units in Stock *</Label>
                          <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                            placeholder="10" className="rounded-xl h-11 border-border bg-background text-white" />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-bold text-muted-foreground">
                            Do you currently hold this item in physical stock? *
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, in_stock: true })}
                              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-xs font-bold transition-all ${
                                productForm.in_stock === true
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                  : "border-border bg-background text-muted-foreground hover:border-emerald-500/40"
                              }`}
                            >
                              <CheckCircle size={15} /> Yes — Ready for instant pickup
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, in_stock: false })}
                              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-xs font-bold transition-all ${
                                productForm.in_stock === false
                                  ? "border-sky-500 bg-sky-500/10 text-sky-300"
                                  : "border-border bg-background text-muted-foreground hover:border-sky-500/40"
                              }`}
                            >
                              <Package size={15} /> No — Confirm & deliver same day
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Variations */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gold-accent">Variations (Sizes, Colors)</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setProductForm({ ...productForm, variations: [...productForm.variations, { name: "", options: "" }] })}
                          className="h-7 text-xs border-border hover:border-gold-accent"
                        >
                          <Plus size={12} className="mr-1" /> Add Option
                        </Button>
                      </div>
                      
                      {productForm.variations.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Optional: Add options like Size (S, M, L) or Color (Red, Blue).</p>
                      ) : (
                        <div className="space-y-3">
                          {productForm.variations.map((v, i) => (
                            <div key={i} className="flex gap-3 items-start bg-background p-3 rounded-xl border border-border">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-[11px] text-muted-foreground mb-1 block">Option Name (e.g. Size)</Label>
                                  <Input 
                                    value={v.name} 
                                    onChange={(e) => {
                                      const newVars = [...productForm.variations];
                                      newVars[i].name = e.target.value;
                                      setProductForm({ ...productForm, variations: newVars });
                                    }}
                                    placeholder="Size" 
                                    className="bg-card border-border h-9 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[11px] text-muted-foreground mb-1 block">Values (comma separated)</Label>
                                  <Input 
                                    value={v.options} 
                                    onChange={(e) => {
                                      const newVars = [...productForm.variations];
                                      newVars[i].options = e.target.value;
                                      setProductForm({ ...productForm, variations: newVars });
                                    }}
                                    placeholder="S, M, L, XL" 
                                    className="bg-card border-border h-9 text-xs"
                                  />
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newVars = productForm.variations.filter((_, idx) => idx !== i);
                                  setProductForm({ ...productForm, variations: newVars });
                                }}
                                className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors mt-5 shrink-0"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-accent border-b border-border/60 pb-2">Product Photos</h3>
                      <div className="space-y-3">
                        <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-gold-accent transition-all cursor-pointer group">
                          <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={e => handleImageChange(e.target.files)} />
                          <ImagePlus size={24} className="mx-auto text-muted-foreground group-hover:text-gold-accent transition-colors mb-2" />
                          <p className="text-xs font-semibold text-white">
                            {productImages.length > 0 ? `${productImages.length} image(s) selected — click to update` : "Click or drag photos to upload"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10MB each</p>
                        </div>
                        {productImagePreviews.length > 0 && (
                          <div className="flex gap-3 flex-wrap mt-3">
                            {productImagePreviews.map((src, i) => (
                              <div key={i} className="h-20 w-20 rounded-xl overflow-hidden border border-border bg-white/5">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 px-6 py-4 border-t border-border/60 bg-background/50">
                    <Button onClick={handleSaveProduct}
                      disabled={isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-gold-accent text-slate-950 hover:bg-accent rounded-xl px-6 h-11 font-bold gap-2 shadow-sm">
                      {(isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {editingProductId ? "Update Product" : "Publish Product"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="rounded-xl px-5 h-11 text-muted-foreground font-semibold">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Controls Bar */}
              {!showAddProduct && sellerProducts && sellerProducts.length > 0 && (
                <div className="bg-card/60 border border-border/80 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search product name..."
                        className="pl-9 h-10 rounded-xl bg-background border-border text-xs text-white"
                      />
                      {productSearch && (
                        <button
                          onClick={() => setProductSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Stock Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border w-full sm:w-auto overflow-x-auto">
                      <button
                        onClick={() => setStockFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          stockFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        All ({sellerProducts.length})
                      </button>
                      <button
                        onClick={() => setStockFilter("in_stock")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          stockFilter === "in_stock" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        In Stock ({sellerProducts.filter(p => p.stock_quantity > 0).length})
                      </button>
                      <button
                        onClick={() => setStockFilter("out_of_stock")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          stockFilter === "out_of_stock" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        Out of Stock ({sellerProducts.filter(p => p.stock_quantity === 0).length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product List */}
              {isProductsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />)}
                </div>
              ) : !sellerProducts || sellerProducts.length === 0 ? (
                !showAddProduct && (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Package size={28} className="text-white/30" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Your store has no products yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">List your first product to display it on UbuntuNow.</p>
                    <Button onClick={() => setShowAddProduct(true)} className="bg-gold-accent text-slate-950 hover:bg-accent rounded-xl px-6 h-11 gap-2 font-bold">
                      <Plus size={16} /> Add First Product
                    </Button>
                  </div>
                )
              ) : filteredProducts.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border py-12 text-center">
                  <Package size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-white mb-1">No products match your filters</p>
                  <p className="text-xs text-muted-foreground mb-4">Try clearing your search query or changing stock filter.</p>
                  <Button
                    variant="outline"
                    onClick={() => { setProductSearch(""); setSelectedCategoryFilter("All"); setStockFilter("all"); }}
                    className="rounded-xl text-xs"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/60 flex items-center gap-2">
                    <Package size={15} className="text-muted-foreground" />
                    <span className="font-bold text-white text-xs">Product Catalog</span>
                    <span className="ml-auto text-xs text-muted-foreground">{filteredProducts.length} item(s)</span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {filteredProducts.map(product => {
                      const img = product.images?.[0]?.image;
                      const inStock = product.stock_quantity > 0;
                      const lowStock = inStock && product.stock_quantity <= 3;
                      const isEditing = editingProductId === String(product.id);
                      return (
                        <div key={product.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                          isEditing ? "bg-gold-bright/10 border-l-4 border-gold-bright" : "hover:bg-white/5"
                        }`}>
                          {/* Cover Thumbnail */}
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                            {img ? (
                              <CloudImage
                                publicId={img}
                                alt={product.name}
                                width={56}
                                height={56}
                                crop="fill"
                                className="w-full h-full object-cover"
                                fallback={<div className="w-full h-full flex items-center justify-center"><ImageOff size={18} className="opacity-25" strokeWidth={1.5} /></div>}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageOff size={18} className="opacity-25" strokeWidth={1.5} /></div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-bold text-sm text-white truncate">{product.name}</span>
                              {isEditing && <span className="text-[10px] font-bold bg-gold-bright/20 text-gold-accent px-2 py-0.5 rounded-full">Editing</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-muted-foreground">{resolveCategoryName(product.category)}</span>
                              <span className="text-muted-foreground">·</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                inStock ? statusConfig.active.color : statusConfig["out-of-stock"].color
                              }`}>
                                {inStock ? `${product.stock_quantity} in stock` : "Out of stock"}
                              </span>
                              {lowStock && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <AlertCircle size={9}/> Low stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0 hidden sm:block">
                            <div className="font-black text-white text-sm">{Number(product.price).toLocaleString()} <span className="text-xs font-bold text-muted-foreground">RWF</span></div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="h-8 px-3 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center gap-1 hover:bg-white/15 transition-colors"
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
                                  deleteProductMutation.mutate(String(product.id), {
                                    onSuccess: () => toast.success("Product deleted."),
                                    onError: () => toast.error("Failed to delete product."),
                                  });
                                }
                              }}
                              className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 text-muted-foreground flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -- ORDERS VIEW --------------------------------- */}
          {view === "orders" && (() => {
            const newOrders       = REAL_ORDERS.filter((o: any) => o.status === "pending");
            const shippingOrders  = REAL_ORDERS.filter((o: any) => o.status === "shipped" || o.status === "picked");
            const doneOrders      = REAL_ORDERS.filter((o: any) => o.status === "completed");

            return (
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-accent mb-1">Store Sales</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Order Management</h1>
                  <p className="text-xs text-muted-foreground mt-1">Track incoming orders and update fulfillment status.</p>
                </div>

                {/* Status Summary Pills */}
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {newOrders.length} New Order{newOrders.length !== 1 ? 's' : ''}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gold-bright/20 text-gold-accent border border-gold-bright/30">
                    {shippingOrders.length} Ready to Ship / Transit
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {doneOrders.length} Completed
                  </span>
                </div>

                {/* Order List */}
                {REAL_ORDERS.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border/80 py-16 flex flex-col items-center text-center px-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                      <ShoppingBag size={26} className="text-white/30" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">No orders yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">Share your store link on social media to start receiving customer orders.</p>
                    {storeUrl && (
                      <button onClick={() => { if (storeSlug) navigator.clipboard.writeText(`${window.location.origin}/shop/${storeSlug}`); toast.success("Store link copied!"); }}
                        className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-accent text-slate-950 text-xs font-bold shadow-sm">
                        <Copy size={13} /> Copy Store Link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {REAL_ORDERS.map((order: any) => {
                      const s = statusConfig[order.status] || statusConfig[(order.status||"").toLowerCase()] || statusConfig.pending;
                      const step = getOrderStep(order.status);
                      const itemCount = order.items?.length || 0;

                      return (
                        <OrderCard
                          key={order.id}
                          order={order}
                          s={s}
                          step={step}
                          itemCount={itemCount}
                          updateStatus={updateStatus}
                          isUpdatingOrder={isUpdatingOrder}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* -- SETTINGS HUB ----------------------------- */}
          {view === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold-accent mb-1">Store Controls</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-xs text-muted-foreground mt-1">Configure your store branding and personal seller profile.</p>
              </div>

              <div className="bg-card rounded-2xl border border-border/80 shadow-sm divide-y divide-border/60 overflow-hidden">
                <button
                  onClick={() => setView("store-settings")}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-gold-bright/15 border border-gold-bright/25 flex items-center justify-center shrink-0">
                    <Store size={19} className="text-gold-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">Store Settings</p>
                    <p className="text-xs text-muted-foreground">Store name, logo, description, and public shop URL</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </button>

                <button
                  onClick={() => setView("profile-settings")}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
                    <User size={19} className="text-sky-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">Profile Settings</p>
                    <p className="text-xs text-muted-foreground">Seller name, phone number, and location address</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </button>

                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-rose-500/5 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <LogOut size={19} className="text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-rose-400 text-sm">Sign out</p>
                    <p className="text-xs text-muted-foreground">End your active seller session on this device</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* -- PROFILE SETTINGS ------------------------ */}
          {view === "profile-settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <button
                onClick={() => setView("settings")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft size={15} /> Back to Settings
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold-accent mb-1">Configuration</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
                <p className="text-xs text-muted-foreground mt-1">Personal contact information and delivery address.</p>
              </div>

              <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </Label>
                  <p className="text-sm text-white font-medium">{userProfile?.email || "—"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">First Name</Label>
                    <Input value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="Amina" className="rounded-xl h-11 border-border bg-background text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Last Name</Label>
                    <Input value={profileForm.last_name} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="Uwase" className="rounded-xl h-11 border-border bg-background text-white" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Phone size={12} /> Phone Number
                    </Label>
                    <Input value={profileForm.phone_number} onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      placeholder="+250 7XX XXX XXX" className="rounded-xl h-11 border-border bg-background text-white" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-4">
                    <MapPin size={12} /> Address / Location
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Street / Address line 1</Label>
                      <Input value={profileForm.address_line1} onChange={e => setProfileForm({ ...profileForm, address_line1: e.target.value })}
                        placeholder="KG 123 St, Nyarugenge" className="rounded-xl h-11 border-border bg-background text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">City / District</Label>
                      <Input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                        placeholder="Kigali" className="rounded-xl h-11 border-border bg-background text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Country</Label>
                      <Input value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                        placeholder="Rwanda" className="rounded-xl h-11 border-border bg-background text-white" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}
                  className="w-full bg-gold-accent text-slate-950 hover:bg-accent rounded-xl h-11 font-bold gap-2 shadow-sm">
                  {updateProfileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Save Profile Changes
                </Button>
              </div>
            </div>
          )}

          {/* -- STORE SETTINGS --------------------------- */}
          {view === "store-settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <button
                onClick={() => setView("settings")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft size={15} /> Back to Settings
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold-accent mb-1">Configuration</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Store Settings</h1>
                <p className="text-xs text-muted-foreground mt-1">Manage public store branding and description.</p>
              </div>

              <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6 md:p-8 space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-5 pb-6 border-b border-border/60">
                  <div className="relative group cursor-pointer shrink-0">
                    <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border overflow-hidden bg-white/5 flex items-center justify-center hover:border-gold-accent transition-colors">
                      {storeLogoPreview ? (
                        <img src={storeLogoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <CloudImage
                          publicId={userProfile?.store?.store_logo || ""}
                          alt={storeName}
                          width={80}
                          height={80}
                          crop="fill"
                          className="w-full h-full object-cover"
                          fallback={<Store size={28} className="text-white/30" />}
                        />
                      )}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                        <ImagePlus size={18} className="text-white" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" id="store_logo_input"
                      onChange={e => e.target.files?.[0] && handleLogoChange(e.target.files[0])} />
                  </div>
                  <div>
                    <Label htmlFor="store_logo_input" className="font-bold text-gold-accent text-sm cursor-pointer hover:underline">Change Store Logo</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Click box to select image.<br />Recommended: Square logo image up to 10MB.</p>
                  </div>
                </div>

                {/* Store Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Store Name *</Label>
                  <Input value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="rounded-xl h-11 border-border bg-background text-white font-semibold" />
                </div>

                {/* Store URL */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Store Link (Read-only)</Label>
                  <div className="flex rounded-xl border border-border bg-background overflow-hidden h-11">
                    <span className="flex items-center px-3.5 text-muted-foreground text-xs bg-white/5 border-r border-border shrink-0">
                      ubuntunow.rw/shop/
                    </span>
                    <input value={storeSlug} readOnly className="bg-transparent px-3 text-xs font-mono text-white/70 w-full outline-none" />
                  </div>
                </div>

                {/* Store Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Store Description</Label>
                  <Textarea value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })}
                    placeholder="Tell buyers about your products, quality, and origin in Rwanda…"
                    className="rounded-xl border-border bg-background text-white resize-none" rows={4} />
                </div>

                {/* Save Button */}
                <Button onClick={handleSaveStoreSettings} disabled={updateStoreMutation.isPending}
                  className="w-full bg-gold-accent text-slate-950 hover:bg-accent rounded-xl h-11 font-bold gap-2 shadow-sm">
                  {updateStoreMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Save Store Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Dashboard"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border/60 pb-[env(safe-area-inset-bottom)] shadow-lg"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive ? "text-gold-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">
                  {item.label === "My Products" ? "Products" : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Skeleton fallback
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-14 border-b border-border" />
      <div className="flex flex-1">
        <div className="hidden lg:block w-64 xl:w-72 border-r border-border" />
        <div className="flex-1 p-6 lg:p-8 space-y-4">
          <div className="h-8 w-56 bg-card rounded-lg animate-pulse" />
          <div className="h-24 bg-card rounded-2xl animate-pulse" />
          <div className="h-24 bg-card rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.replace("/auth");
      return;
    }
    setRole(localStorage.getItem("user_role"));
  }, [router]);

  if (role === undefined) return <DashboardSkeleton />;
  if (role === "seller") return <SellerDashboardView />;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BuyerDashboard />
    </Suspense>
  );
}
