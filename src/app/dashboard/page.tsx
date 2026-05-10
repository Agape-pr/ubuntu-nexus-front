"use client";

import { useState, useEffect, useRef } from "react";
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
  Tag, X, ImagePlus, ArrowRight, Sparkles, BarChart2, Star, Truck, Bell, Zap, Link2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, useSellerProducts, useDeleteProduct } from "@/lib/api/hooks/useProducts";
import { useSellerOrders, useUpdateOrderStatus } from "@/lib/api/hooks/useOrders";

import { useCurrentUser, useUpdateStore } from "@/lib/api/hooks/useUsers";
import { toast } from "sonner";
import { CloudImage } from "@/components/ui/CloudImage";

type DashView = "overview" | "products" | "orders" | "store-settings";

// Removed dummy REAL_ORDERS constant

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

// -- Order pipeline steps ---------------------------------------------
const ORDER_STEPS = [
  { key: "pending",   step: 1, label: "New Order",          short: "New",         apiStatus: "pending"   },
  { key: "shipped",  step: 2, label: "Ready to Ship",      short: "Shipping",    apiStatus: "shipped"   },
  { key: "picked",   step: 3, label: "Picked by Delivery", short: "On the way",  apiStatus: "picked"    },
  { key: "completed",step: 4, label: "Completed",          short: "Done",        apiStatus: "completed" },
];

function getOrderStep(status: string): number {
  const s = (status || "").toLowerCase();
  if (s === "completed")                                             return 4;
  if (s === "picked" || s === "out_for_delivery" || s === "in_transit" || s === "ready_for_pickup") return 3;
  if (s === "shipped" || s === "ready_to_ship")                     return 2;
  return 1; // pending / confirmed / anything else → New Order
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  // -- Pending / New --
  pending:          { color: "bg-white/10 text-white/80 border border-white/15",              dot: "bg-white/50",    label: "New Order" },
  confirmed:        { color: "bg-white/10 text-white/80 border border-white/15",              dot: "bg-white/50",    label: "New Order" },
  PENDING:          { color: "bg-white/10 text-white/80 border border-white/15",              dot: "bg-white/50",    label: "New Order" },
  // -- Shipped / Ready to ship --
  shipped:          { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  ready_to_ship:    { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  SHIPPED:          { color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", dot: "bg-gold-bright", label: "Ready to Ship" },
  // -- Picked / Out for delivery --
  picked:           { color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",        dot: "bg-blue-400",   label: "Picked by Delivery" },
  out_for_delivery: { color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",        dot: "bg-blue-400",   label: "Picked by Delivery" },
  ready_for_pickup: { color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",        dot: "bg-blue-400",   label: "Picked by Delivery" },
  in_transit:       { color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",        dot: "bg-blue-400",   label: "Picked by Delivery" },
  // -- Completed --
  completed:        { color: "bg-success/20 text-success border border-success/30",           dot: "bg-success",    label: "Completed" },
  COMPLETED:        { color: "bg-success/20 text-success border border-success/30",           dot: "bg-success",    label: "Completed" },
  // -- Product-level only --
  "out-of-stock":   { color: "bg-rose-500/20 text-rose-400 border border-rose-500/30",        dot: "bg-rose-400",   label: "Out of stock" },
  active:           { color: "bg-success/20 text-success border border-success/30",           dot: "bg-success",    label: "Active" },
};

// -- OrderCard: expandable card with 4-step timeline -----------------
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
    { n: 1, label: "New Order",          sub: "Order placed" },
    { n: 2, label: "Ready to Ship",      sub: "Seller confirmed" },
    { n: 3, label: "Picked by Delivery", sub: "On the way" },
    { n: 4, label: "Completed",          sub: "Payment released" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* -- Collapsed header ----------------------- */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-white/5 transition-colors"
      >
        {/* Icon */}
        <div className="h-10 w-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <Package size={18} className="text-white/50" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">Order #{order.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
              {s.label}
            </span>
          </div>
          <div className="text-xs text-white/40">
            {new Date(order.created_at).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })}
            {" · "}
            {new Date(order.created_at).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="mt-1.5">
            <span className="font-black text-white text-base">{parseFloat(order.total_amount).toLocaleString()} </span>
            <span className="text-xs font-bold text-white/40">RWF</span>
            <span className="text-xs text-white/30 ml-2">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          size={18}
          className={`text-white/30 shrink-0 mt-2 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* -- Expanded detail ------------------------- */}
      {expanded && (
        <div className="px-4 pb-5 space-y-5 border-t border-white/8">

          {/* 4-step timeline */}
          <div className="pt-4">
            <div className="flex items-start justify-between gap-1 relative">
              {/* Connecting line behind steps */}
              <div className="absolute top-4 left-4 right-4 h-px bg-white/10 z-0" />

              {stepDefs.map((sd) => {
                const isDone    = step > sd.n;
                const isCurrent = step === sd.n;
                const isFuture  = step < sd.n;

                const circleClass = isDone
                  ? "bg-success text-white border-success"
                  : isCurrent
                  ? "bg-gold-bright text-near-black border-gold-bright"
                  : "bg-white/5 text-white/30 border-white/15";

                return (
                  <button
                    key={sd.n}
                    disabled={isFuture}
                    onClick={() => {
                      // Step 1→2: only seller can trigger (Ready to Ship)
                      if (sd.n === 2 && order.status === "pending") {
                        updateStatus({ id: order.id, status: "shipped" });
                      }
                      // Steps 3 & 4 are still in dev — clickable but no-op for now
                    }}
                    className={`flex flex-col items-center gap-1.5 z-10 relative flex-1 group ${isFuture ? "cursor-default opacity-50" : "cursor-pointer"}`}
                  >
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all ${circleClass} ${!isFuture ? "group-hover:scale-110" : ""}`}>
                      {isDone ? <CheckCircle size={14} /> : sd.n}
                    </div>
                    <div className="text-center">
                      <div className={`text-[10px] font-bold leading-tight ${isCurrent ? "text-gold-accent" : isDone ? "text-success" : "text-white/30"}`}>
                        {sd.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items ordered */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Items Ordered</p>
            <div className="bg-white/5 rounded-xl divide-y divide-white/8 overflow-hidden">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <div className="h-9 w-9 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Package size={14} className="text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{item.product_name}</div>
                    <div className="text-xs text-white/40">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-white shrink-0">
                    {parseFloat(item.total_price || item.price || "0").toLocaleString()} <span className="text-xs text-white/40">RWF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment status */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Payment</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span className={`text-sm font-bold ${order.status === "completed" ? "text-success" : "text-gold-bright"}`}>
                {order.status === "completed" ? "Payment Released" : "Held in Escrow"}
              </span>
            </div>
          </div>

          {/* Action button — only shown for seller-actionable states */}
          {order.status === "pending" && (
            <button
              onClick={() => updateStatus({ id: order.id, status: "shipped" })}
              disabled={isUpdatingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-bright text-near-black font-bold text-sm hover:bg-gold-accent transition-colors disabled:opacity-50"
            >
              <Truck size={15} /> Ready to Ship
            </button>
          )}
          {order.status === "shipped" && (
            <button
              onClick={() => updateStatus({ id: order.id, status: "picked" })}
              disabled={isUpdatingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <Package size={15} /> Mark Picked by Delivery
            </button>
          )}
          {order.status === "picked" && (
            <button
              onClick={() => updateStatus({ id: order.id, status: "completed" })}
              disabled={isUpdatingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-success/20 text-success border border-success/30 font-bold text-sm hover:bg-success/30 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> Mark Completed
            </button>
          )}
          {order.status === "completed" && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 text-success border border-success/20 text-sm font-bold">
              <CheckCircle size={15} /> Order Complete · Payment Released
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SellerDashboard() {

  const router = useRouter();
  const [view, setView] = useState<DashView>("overview");
  const [copied, setCopied] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);
  const { data: userProfile, isLoading: isUserLoading } = useCurrentUser();
  const { data: sellerProducts, isLoading: isProductsLoading } = useSellerProducts();
  const { data: realOrdersData, isLoading: isOrdersLoading } = useSellerOrders();
  const { mutate: updateStatus, isPending: isUpdatingOrder } = useUpdateOrderStatus();
  const REAL_ORDERS = realOrdersData || [];
  
  const [productForm, setProductForm] = useState({
    name: "", price: "", stock_quantity: "", category: "", description: "",
    in_stock: null as boolean | null,  // null = unanswered (required)
  });
  const [storeForm, setStoreForm] = useState({ name: "", description: "" });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateStoreMutation = useUpdateStore();

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role !== "seller") router.push("/marketplace");
  }, [router]);

  useEffect(() => {
    if (userProfile?.store) {
      setStoreForm({
        name: userProfile.store.store_name || "",
        description: userProfile.store.store_description || "",
      });
    }
  }, [userProfile]);



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
      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity),
        category: productForm.category,
        description: productForm.description,
        is_active: true,
        in_stock: productForm.in_stock,
        uploaded_images: productImages.length > 0 ? productImages : undefined,
      };

      const opts = {
        onSuccess: () => {
          setShowAddProduct(false);
          setEditingProductId(null);
          setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "", in_stock: null });
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
    setProductForm({
      name: product.name, price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category.toString(),
      description: product.description || "",
      in_stock: typeof product.in_stock === 'boolean' ? product.in_stock : null,
    });
    setProductImages([]);
    setProductImagePreviews([]);
    setShowAddProduct(true);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const storeName = userProfile?.store?.store_name || "My Store";
  const storeSlug = userProfile?.store?.slug || "";
  const storeUrl = storeSlug ? `/store/${storeSlug}` : null;
  const storeUrlDisplay = storeSlug
    ? `www.ubuntunow.rw/store/${storeSlug}`
    : isUserLoading
    ? "Loading your store link…"
    : "www.ubuntunow.rw/store/your-store";
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
    { id: "store-settings" as DashView, label: "Store Settings", icon: Settings },
  ];

  const totalRevenue = REAL_ORDERS.reduce((sum: number, order: any) => sum + (parseFloat(order?.total_amount) || 0), 0);
  const pendingOrders = REAL_ORDERS.filter((o: any) => o.status === "pending").length;

  const STATS = [
    { label: "Active Listings", value: isProductsLoading ? "…" : String(activeProductsCount), sub: "Products live in your store", icon: Package, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
    { label: "Total Orders", value: String(REAL_ORDERS.length), sub: pendingOrders > 0 ? `${pendingOrders} awaiting action` : "All fulfilled", icon: ShoppingBag, iconBg: "bg-gold-bright/20", iconColor: "text-gold-accent" },
    { label: "Revenue Earned", value: totalRevenue > 0 ? `${totalRevenue.toLocaleString()}` : "0", sub: totalRevenue > 0 ? "RWF · All time" : "Start selling today", icon: Wallet, iconBg: "bg-violet-500/20", iconColor: "text-violet-400" },
    { label: "Store Status", value: storeSlug ? "Live ✦" : "Setup", sub: storeSlug ? "Accepting orders" : "Complete your store", icon: Zap, iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* -- Mobile/Tablet Tab Bar -- shown below Navbar, hidden on lg+ -- */}
      <div className="lg:hidden sticky top-14 z-30 bg-background border-b border-border shadow-sm">
        <div className="flex w-full px-2 py-2 gap-1">
          {navItems.map(item => {
            const isActive = view === item.id;
            // Labels shortened for the inactive compact state
            const shortLabel = item.label === "My Products" ? "Products"
              : item.label === "Store Settings" ? "Settings"
              : item.label;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{ flex: isActive ? "2 1 0%" : "1 1 0%" }}
                className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-slate-900 py-2.5 px-3 min-w-0"
                    : "bg-transparent py-2 min-w-0 hover:bg-slate-50"
                }`}
              >
                {isActive ? (
                  /* -- Active: icon + label side by side in pill -- */
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <item.icon size={15} className="text-gold-accent shrink-0" />
                    <span className="text-white text-xs font-bold tracking-wide truncate">
                      {shortLabel}
                    </span>
                  </div>
                ) : (
                  /* -- Inactive: icon only + tiny label below -- */
                  <>
                    <item.icon size={17} className="text-white/40" />
                    <span className="text-[9px] font-semibold text-white/40 mt-0.5 tracking-wide">
                      {shortLabel}
                    </span>
                  </>
                )}
                {/* Amber accent dot at bottom of active tab */}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gold-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>


      <div className="flex flex-1">
        {/* -- Sidebar ---------------------------------- */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-white border-r border-slate-100 sticky top-16 h-[calc(100vh-64px)]">
          {/* Store identity */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      fallback={<span className="text-white/80 font-bold text-sm">{storeInitials}</span>}
                    />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-sm truncate">{isUserLoading ? "Loading..." : storeName}</div>
                <div className="text-[11px] text-white/40 font-medium">Verified Seller ✦</div>
              </div>
            </div>

            {/* Store link pill */}
            {storeUrl ? (
              <Link href={storeUrl} target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all group">
                <ExternalLink size={12} className="text-white/40 group-hover:text-white/60 flex-shrink-0" />
                <span className="text-[11px] text-white/50 truncate flex-1">{storeUrlDisplay}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 opacity-60 cursor-not-allowed">
                {isUserLoading ? <Loader2 size={12} className="animate-spin text-white/40 flex-shrink-0" /> : <ExternalLink size={12} className="text-white/30 flex-shrink-0" />}
                <span className="text-[11px] text-white/40 truncate flex-1">{storeUrlDisplay}</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  view === item.id
                    ? "bg-amber-500 text-black font-bold shadow-md"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}>
                <item.icon size={16} className={view === item.id ? "text-black" : ""} />
                {item.label}
                {view === item.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>

          {/* View Store CTA */}
          <div className="p-4 border-t border-border">
            {storeUrl ? (
              <Link href={storeUrl} target="_blank">
                <Button variant="outline" className="w-full rounded-2xl h-10 text-sm font-semibold gap-2 border-slate-200 hover:border-slate-300">
                  <Eye size={14} /> Preview My Store
                </Button>
              </Link>
            ) : (
              <Button variant="outline" disabled className="w-full rounded-2xl h-10 text-sm font-semibold gap-2 border-slate-200 opacity-60 cursor-not-allowed">
                {isUserLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                {isUserLoading ? "Loading store…" : "Preview unavailable"}
              </Button>
            )}
            <button className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-xs text-white/40 hover:text-rose-500 transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* -- Main content ----------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-background">

          {/* -- OVERVIEW ------------------------------- */}
          {view === "overview" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">

              {/* -- Greeting -- */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white/40 mb-0.5">{getGreeting()}, {storeName} 👋</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                    Here's your store at a glance
                  </h1>
                  {pendingOrders > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-gold-accent text-sm font-semibold">
                      <Bell size={14} className="animate-pulse" />
                      {pendingOrders} order{pendingOrders > 1 ? 's' : ''} waiting for your action
                    </div>
                  )}
                </div>
                <Button onClick={() => { setView("products"); setShowAddProduct(true); }}
                  className="bg-gold-bright text-near-black hover:bg-gold-accent rounded-2xl px-6 h-11 gap-2 font-bold shadow-md transition-all hover:-translate-y-0.5 shrink-0">
                  <Plus size={16} /> List a Product
                </Button>
              </div>

              {/* -- Stats cards -- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {STATS.map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-2xl p-4 md:p-5 border border-white/10 hover:-translate-y-0.5 transition-all group cursor-default">
                    <div className={`h-9 w-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <stat.icon size={17} className={stat.iconColor} />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-white leading-none mb-1">{stat.value}</div>
                    <div className="text-[11px] font-bold text-white/60">{stat.label}</div>
                    <div className="text-[10px] text-white/40 mt-1 leading-snug">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* -- Store link card -- */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-gold-accent/10 blur-3xl" />
                  <div className="absolute bottom-0 left-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Your Store is Live</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mt-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 size={13} className="text-white/40 shrink-0" />
                        <span className="text-white font-mono text-sm md:text-base truncate">{storeUrlDisplay}</span>
                      </div>
                      <p className="text-white/40 text-xs">Share this link with customers on WhatsApp, Instagram, or anywhere.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => { if (!storeSlug) return; navigator.clipboard.writeText(`https://${storeUrlDisplay}`); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Link copied! 🔗"); }}
                        disabled={!storeSlug}
                        className="bg-gold-accent text-white hover:bg-amber-300 rounded-xl font-bold gap-2 h-10 px-4 text-sm disabled:opacity-50 transition-all">
                        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy link"}
                      </Button>
                      {storeUrl ? (
                        <Link href={storeUrl} target="_blank">
                          <Button variant="outline" className="rounded-xl border-white/20 text-white bg-foreground/5 hover:bg-foreground/15 h-10 px-4 gap-2 text-sm">
                            <Eye size={14} /> Preview
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" disabled className="rounded-xl border-white/10 text-white/30 bg-foreground/5 h-10 px-4 gap-2 text-sm cursor-not-allowed">
                          {isUserLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* -- Recent Orders -- */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={15} className="text-white/40" />
                    <h2 className="font-bold text-white text-sm">Recent Orders</h2>
                    {REAL_ORDERS.length > 0 && <span className="text-xs font-bold bg-slate-100 text-white/50 px-2 py-0.5 rounded-full">{REAL_ORDERS.length}</span>}
                  </div>
                  <button onClick={() => setView("orders")} className="text-xs font-semibold text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={12} />
                  </button>
                </div>

                {REAL_ORDERS.length === 0 ? (
                  <div className="px-6 py-12 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 shadow-inner">
                      <ShoppingBag size={22} className="text-white/30" />
                    </div>
                    <p className="font-bold text-white/80 mb-1">No orders yet — but they're coming!</p>
                    <p className="text-sm text-white/40 max-w-xs leading-relaxed">Share your store link on WhatsApp and Instagram to get your first order today.</p>
                    {storeUrl && (
                      <button onClick={() => { navigator.clipboard.writeText(`https://${storeUrlDisplay}`); toast.success("Link copied! Share it now 🚀"); }}
                        className="mt-4 flex items-center gap-2 text-xs font-bold text-gold-primary hover:text-amber-700 transition-colors">
                        <Copy size={12} /> Copy store link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {REAL_ORDERS.slice(0, 5).map((order: any) => {
                      const s = statusConfig[order.status];
                      const isPending = order.status === "pending";
                      return (
                        <div key={order.id} className={`px-5 py-4 flex items-center gap-4 transition-colors ${ isPending ? "bg-amber-50/40" : "hover:bg-card/60" }`}>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            order.status === "completed" ? "bg-emerald-100" :
                            order.status === "shipped" ? "bg-blue-100" : "bg-gold-tint"
                          }`}>
                            {order.status === "completed" ? "✅" : order.status === "shipped" ? "🚚" : "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">Order #{order.id}</span>
                              {isPending && <span className="text-[9px] font-black uppercase tracking-wider bg-gold-accent text-white px-1.5 py-0.5 rounded-full">Action needed</span>}
                            </div>
                            <div className="text-xs text-white/40 truncate mt-0.5">{order.items?.map((i: any) => i.product_name).join(', ')}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-sm text-white">{parseFloat(order.total_amount).toLocaleString()} <span className="text-[10px] font-bold text-white/40">RWF</span></div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s?.color || 'bg-slate-100 text-white/50'}`}>{order.status?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* -- PRODUCTS ------------------------------- */}
          {view === "products" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {showAddProduct
                      ? (editingProductId ? `Edit "${productForm.name || 'Product'}"` : "New Product")
                      : `${sellerProducts?.length || 0} Products`}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {showAddProduct ? (
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="gap-2 text-white/50 rounded-2xl">
                      <X size={15} /> Cancel
                    </Button>
                  ) : (
                    <Button onClick={() => { setEditingProductId(null); setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "", in_stock: null }); setProductImages([]); setProductImagePreviews([]); setShowAddProduct(true); }}
                      className="bg-slate-900 text-white rounded-2xl px-6 h-11 gap-2 font-semibold shadow-md hover:-translate-y-0.5 transition-all">
                      <Plus size={16} /> Add Product
                    </Button>
                  )}
                </div>
              </div>

              {/* -- Add/Edit Form -- */}
              {showAddProduct && (
                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-fade-up">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-background/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {editingProductId
                        ? <><Edit3 size={20} className="text-gold-bright"/> {productForm.name || 'Product'}</>
                        : <><Sparkles size={20} className="text-gold-bright"/> New Product</>}
                    </h2>
                    <button onClick={() => { setShowAddProduct(false); setEditingProductId(null); }} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <X size={15} className="text-white/50" />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 space-y-10">
                    {/* Section: Product Info */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border pb-2 mb-5">Product Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Product Name *</Label>
                          <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Ankara Print Tote Bag" className="rounded-2xl h-11 border-white/20 bg-white/5 text-white" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Category *</Label>
                          <Select value={productForm.category} onValueChange={(val) => setProductForm({ ...productForm, category: val })}>
                            <SelectTrigger className="rounded-2xl h-11 border-white/20 bg-white/5 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Description</Label>
                          <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Tell buyers what makes this product special — material, origin, size, care instructions…"
                            className="rounded-2xl border-white/20 bg-white/5 text-white resize-none" rows={4} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Pricing & Availability */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border pb-2 mb-5">Pricing & Availability</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Price (RWF) *</Label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">RWF</span>
                            <Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="12,500" className="rounded-2xl h-11 border-white/20 bg-white/5 text-white pl-12" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Stock Quantity *</Label>
                          <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                            placeholder="e.g. 10" className="rounded-2xl h-11 border-white/20 bg-white/5 text-white" />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Do you currently have this item in stock? *
                          </Label>
                          <p className="text-xs text-white/40 -mt-1 mb-2">
                            This sets the delivery label buyers see on your listing.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, in_stock: true })}
                              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 text-sm font-semibold transition-all ${
                                productForm.in_stock === true
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-white/50 hover:border-emerald-300 hover:bg-emerald-50/30"
                              }`}
                            >
                              ✅ Yes — Ready for quick delivery
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, in_stock: false })}
                              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 text-sm font-semibold transition-all ${
                                productForm.in_stock === false
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-slate-50 text-white/50 hover:border-blue-300 hover:bg-blue-50/30"
                              }`}
                            >
                              📦 No — Confirm & deliver same day
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Images */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-border pb-2 mb-5">Product Photos</h3>
                      <div className="space-y-3">
                        <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer group">
                          <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={e => handleImageChange(e.target.files)} />
                          <ImagePlus size={28} className="mx-auto text-white/30 group-hover:text-gold-accent transition-colors mb-3" />
                          <p className="text-sm font-semibold text-white/50">
                            {productImages.length > 0 ? `${productImages.length} image(s) selected — click to change` : "Click to upload product photos"}
                          </p>
                          <p className="text-xs text-white/40 mt-1">PNG, JPG, WEBP up to 10MB each</p>
                        </div>
                        {productImagePreviews.length > 0 && (
                          <div className="flex gap-3 flex-wrap mt-4">
                            {productImagePreviews.map((src, i) => (
                              <div key={i} className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 px-6 py-5 border-t border-border bg-background/50">
                    <Button onClick={handleSaveProduct}
                      disabled={isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-slate-900 text-white rounded-2xl px-8 h-12 font-semibold gap-2 shadow-sm hover:-translate-y-0.5 transition-all">
                      {(isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {editingProductId ? "Update Product" : "Publish Product"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="rounded-2xl px-6 h-12 text-white/50 font-semibold hover:bg-slate-200">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* -- Product List (always visible when not loading) -- */}
              {isProductsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : !sellerProducts || sellerProducts.length === 0 ? (
                !showAddProduct && (
                  <div className="bg-card rounded-3xl border border-border p-16 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                      <Package size={32} className="text-white/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Your store is ready</h3>
                    <p className="text-white/50 max-w-sm mx-auto mb-8">Add your first product and start sharing it with thousands of buyers across Rwanda.</p>
                    <Button onClick={() => setShowAddProduct(true)} className="bg-slate-900 text-white rounded-2xl px-8 h-12 gap-2 font-semibold">
                      <Plus size={16} /> Add First Product
                    </Button>
                  </div>
                )
              ) : (
                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                    <Package size={16} className="text-white/40" />
                    <span className="font-bold text-white text-sm">All Products</span>
                    <span className="ml-auto text-xs font-bold text-white/40">{sellerProducts.length} listed</span>
                  </div>
                  <div className="divide-y divide-border">
                    {sellerProducts.map(product => {
                      const img = product.images?.[0]?.image;
                      const inStock = product.stock_quantity > 0;
                      const lowStock = inStock && product.stock_quantity <= 3;
                      const isEditing = editingProductId === String(product.id);
                      return (
                        <div key={product.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          isEditing ? "bg-amber-50/60 border-l-4 border-amber-400" : "hover:bg-card/60"
                        }`}>
                          {/* Thumbnail */}
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {img ? (
                              <CloudImage
                                publicId={img}
                                alt={product.name}
                                width={64}
                                height={64}
                                crop="fill"
                                className="w-full h-full object-cover"
                                fallback={<div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-bold text-white truncate">{product.name}</span>
                              {isEditing && <span className="text-[10px] font-bold bg-gold-tint text-amber-700 px-2 py-0.5 rounded-full">Editing…</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-white/40">{product.category}</span>
                              <span className="text-white/30">·</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                inStock ? statusConfig.active.color : statusConfig["out-of-stock"].color
                              }`}>{inStock ? "In stock" : "Out of stock"}</span>
                              {lowStock && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><AlertCircle size={9}/> Low</span>}
                              {product.in_stock === true && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">⚡ Quick delivery</span>}
                              {product.in_stock === false && <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">📦 Same day</span>}
                            </div>
                          </div>

                          {/* Price + qty */}
                          <div className="text-right shrink-0 hidden sm:block">
                            <div className="font-black text-white">{Number(product.price).toLocaleString()} <span className="text-xs font-bold text-white/40">RWF</span></div>
                            <div className="text-xs text-white/40 mt-0.5">{product.stock_quantity} qty</div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="h-9 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition-colors">
                              <Edit3 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                                  deleteProductMutation.mutate(product.id, {
                                    onSuccess: () => toast.success("Product deleted."),
                                    onError: () => toast.error("Failed to delete product."),
                                  });
                                }
                              }}
                              className="h-9 w-9 rounded-2xl border border-slate-200 bg-white text-white/40 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors">
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

          {/* -- ORDERS --------------------------------- */}
          {view === "orders" && (() => {
            const newOrders       = REAL_ORDERS.filter((o: any) => o.status === "pending");
            const shippingOrders  = REAL_ORDERS.filter((o: any) => o.status === "shipped" || o.status === "picked");
            const doneOrders      = REAL_ORDERS.filter((o: any) => o.status === "completed");

            return (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
                {/* Header */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Sales Activity</p>
                  <h1 className="text-2xl font-bold text-white">Order Notifications</h1>
                </div>

                {/* Summary pills */}
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/10">
                    {newOrders.length} New
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gold-bright/20 text-gold-accent border border-gold-bright/30">
                    {shippingOrders.length} Shipping
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30">
                    {doneOrders.length} Done
                  </span>
                </div>

                {/* Order cards */}
                {REAL_ORDERS.length === 0 ? (
                  <div className="bg-card rounded-3xl border border-border py-20 flex flex-col items-center text-center px-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                      <ShoppingBag size={28} className="text-white/20" />
                    </div>
                    <h3 className="font-bold text-white/80 text-lg mb-2">No orders yet</h3>
                    <p className="text-sm text-white/40 max-w-sm">Once customers start buying, orders appear here. Share your store link!</p>
                    {storeUrl && (
                      <button onClick={() => { navigator.clipboard.writeText(`https://${storeUrlDisplay}`); toast.success("Link copied!"); }}
                        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold-bright text-near-black text-sm font-bold">
                        <Copy size={14} /> Copy Store Link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {REAL_ORDERS.map((order: any) => {
                      const s = statusConfig[order.status] || statusConfig[(order.status||"").toLowerCase()] || statusConfig.pending;
                      const step    = getOrderStep(order.status);
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

          {/* -- STORE SETTINGS ------------------------- */}
          {view === "store-settings" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Configuration</p>
                <h1 className="text-3xl font-bold text-white">Store Settings</h1>
                <p className="text-white/50 mt-1">Manage your store identity and public profile.</p>
              </div>

              <div className="bg-card rounded-3xl border border-border shadow-sm p-8 space-y-8">
                {/* Logo */}
                <div className="flex items-center gap-6 pb-8 border-b border-border">
                  <div className="relative group cursor-pointer flex-shrink-0">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden bg-white/5 flex items-center justify-center hover:border-amber-400 transition-colors">
                      {storeLogoPreview ? (
                        <img src={storeLogoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <CloudImage
                          publicId={userProfile?.store?.store_logo || ""}
                          alt={storeName}
                          width={96}
                          height={96}
                          crop="fill"
                          className="w-full h-full object-cover"
                          fallback={<Store size={32} className="text-white/20" />}
                        />
                      )}
                      <div className="absolute inset-0 bg-near-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                        <ImagePlus size={20} className="text-white" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" id="store_logo_input"
                      onChange={e => e.target.files?.[0] && handleLogoChange(e.target.files[0])} />
                  </div>
                  <div>
                    <Label htmlFor="store_logo_input" className="font-bold text-gold-bright cursor-pointer">Store Logo</Label>
                    <p className="text-sm text-white/50 mt-1">Click the image to upload a new logo.<br />Recommended: square image, 500×500px, max 10MB.</p>
                  </div>
                </div>

                {/* Store name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Store Name *</Label>
                  <Input value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="rounded-2xl h-12 border-white/20 bg-white/5 text-white font-semibold" />
                </div>

                {/* Store URL (read-only) */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Store URL</Label>
                  <div className="flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden h-12">
                    <span className="flex items-center px-4 text-white/40 text-sm bg-slate-100 border-r border-slate-200 flex-shrink-0">
                      ubuntunow.rw/store/
                    </span>
                    <input value={storeSlug} readOnly className="bg-transparent px-4 text-sm font-mono text-white/60 w-full outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Store Description</Label>
                  <Textarea value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })}
                    placeholder="Describe your store — what you sell, your story, your values…"
                    className="rounded-2xl border-white/20 bg-white/5 text-white resize-none" rows={5} />
                </div>

                {/* Save */}
                <Button onClick={handleSaveStoreSettings} disabled={updateStoreMutation.isPending}
                  className="w-full bg-slate-900 text-white rounded-2xl h-12 font-bold gap-2 hover:-translate-y-0.5 transition-all">
                  {updateStoreMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Save Changes
                </Button>
              </div>

              {/* Preview CTA */}
              {storeUrl ? (
                <Link href={storeUrl} target="_blank">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-gold-accent flex items-center justify-center flex-shrink-0">
                      <Eye size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-0.5">See how your store looks</div>
                      <div className="text-white/40 text-sm">Preview your public store page with all your products.</div>
                    </div>
                    <ArrowRight size={18} className="text-white/50" />
                  </div>
                </Link>
              ) : (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center gap-4 opacity-60 cursor-not-allowed">
                  <div className="h-12 w-12 rounded-2xl bg-gold-accent/60 flex items-center justify-center flex-shrink-0">
                    {isUserLoading ? <Loader2 size={22} className="text-white animate-spin" /> : <Eye size={22} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-0.5">{isUserLoading ? "Loading store link…" : "Store link unavailable"}</div>
                    <div className="text-white/40 text-sm">Your store URL will appear here once your profile has loaded.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
