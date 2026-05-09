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
  Eye, LayoutDashboard, Wallet, LogOut, ChevronRight, Search,
  Tag, X, ImagePlus, ArrowRight, Sparkles, BarChart2, Star, Truck,
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

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  pending:   { color: "bg-amber-50 text-amber-700 border border-amber-200",   dot: "bg-amber-400",   label: "Pending" },
  shipped:   { color: "bg-blue-50 text-blue-700 border border-blue-200",      dot: "bg-blue-400",    label: "Shipped" },
  completed: { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Completed" },
  "out-of-stock": { color: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-400",   label: "Out of stock" },
  active:    { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Active" },
};

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



  const navItems = [
    { id: "overview" as DashView, label: "Overview", icon: LayoutDashboard },
    { id: "products" as DashView, label: "My Products", icon: Package },
    { id: "orders" as DashView, label: "Orders", icon: ShoppingBag },
    { id: "store-settings" as DashView, label: "Store Settings", icon: Settings },
  ];

  const totalRevenue = REAL_ORDERS.reduce((sum: number, order: any) => sum + (parseFloat(order?.total_amount) || 0), 0);

  const STATS = [
    { label: "Active Listings", value: isProductsLoading ? "…" : String(activeProductsCount), sub: "Across your store", icon: Package, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Store Views", value: "0", sub: "Analytics coming soon", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Orders", value: String(REAL_ORDERS.length), sub: REAL_ORDERS.length === 0 ? "No orders yet" : `${REAL_ORDERS.length} order${REAL_ORDERS.length !== 1 ? "s" : ""}`, icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Revenue", value: `${totalRevenue.toLocaleString()} RWF`, sub: totalRevenue === 0 ? "No revenue yet" : "All time", icon: Wallet, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* ── Mobile/Tablet Tab Bar ── shown below Navbar, hidden on lg+ ── */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                view === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <item.icon size={14} className={view === item.id ? "text-amber-400" : ""} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1">
        {/* ── Sidebar ────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-white border-r border-slate-100 sticky top-16 h-[calc(100vh-64px)]">
          {/* Store identity */}
          <div className="p-6 border-b border-slate-100">
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
                      fallback={<span className="text-slate-700 font-bold text-sm">{storeInitials}</span>}
                    />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{isUserLoading ? "Loading..." : storeName}</div>
                <div className="text-[11px] text-slate-400 font-medium">Verified Seller ✦</div>
              </div>
            </div>

            {/* Store link pill */}
            {storeUrl ? (
              <Link href={storeUrl} target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all group">
                <ExternalLink size={12} className="text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 truncate flex-1">{storeUrlDisplay}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 opacity-60 cursor-not-allowed">
                {isUserLoading ? <Loader2 size={12} className="animate-spin text-slate-400 flex-shrink-0" /> : <ExternalLink size={12} className="text-slate-300 flex-shrink-0" />}
                <span className="text-[11px] text-slate-400 truncate flex-1">{storeUrlDisplay}</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  view === item.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}>
                <item.icon size={16} className={view === item.id ? "text-amber-400" : ""} />
                {item.label}
                {view === item.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>

          {/* View Store CTA */}
          <div className="p-4 border-t border-slate-100">
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
            <button className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-xs text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">

          {/* ── OVERVIEW ─────────────────────────────── */}
          {view === "overview" && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Seller Dashboard</p>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back 👋
                  </h1>
                  <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
                </div>
                <Button onClick={() => { setView("products"); setShowAddProduct(true); }}
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-6 h-11 gap-2 font-semibold shadow-md transition-all hover:-translate-y-0.5">
                  <Plus size={16} /> List a Product
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(stat => (
                  <div key={stat.label} className={`bg-white rounded-3xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all group`}>
                    <div className={`h-10 w-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
                    <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-medium">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Store link card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute bottom-0 left-24 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <Store size={13} /> Your Public Store
                    </div>
                    <div className="text-white font-mono text-lg mb-1">{storeUrlDisplay}</div>
                    <p className="text-slate-400 text-sm">Share this link with your customers to drive traffic to your store.</p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Button onClick={() => { if (!storeSlug) return; navigator.clipboard.writeText(`https://${storeUrlDisplay}`); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Link copied!"); }}
                      disabled={!storeSlug}
                      className="bg-amber-400 text-slate-900 hover:bg-amber-300 rounded-2xl font-bold gap-2 h-11 px-5 disabled:opacity-50">
                      {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    {storeUrl ? (
                      <Link href={storeUrl} target="_blank">
                        <Button variant="outline" className="rounded-2xl border-white/20 text-white bg-white/5 hover:bg-white/10 h-11 px-5 gap-2">
                          <Eye size={15} /> Preview
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="rounded-2xl border-white/20 text-white/40 bg-white/5 h-11 px-5 gap-2 cursor-not-allowed">
                        {isUserLoading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Recent Orders</h2>
                  <button onClick={() => setView("orders")} className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                {REAL_ORDERS.length === 0 ? (
                  <div className="px-6 py-14 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <ShoppingBag size={24} className="text-slate-300" />
                    </div>
                    <p className="font-semibold text-slate-700 mb-1">No orders yet</p>
                    <p className="text-sm text-slate-400 max-w-xs">When customers place orders from your store, they'll show up here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {REAL_ORDERS.map((order: any) => {
                      const s = statusConfig[order.status];
                      const statusEmoji: Record<string, string> = { completed: "✅", shipped: "🚚", pending: "📦" };
                      const statusBg: Record<string, string> = { completed: "bg-emerald-50", shipped: "bg-blue-50", pending: "bg-amber-50" };
                      return (
                        <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/60 transition-colors">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${statusBg[order.status?.toLowerCase()] || "bg-slate-100"}`}>
                            {statusEmoji[order.status?.toLowerCase()] || "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900">Order #{order.id}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {order.items?.map((i: any) => i.product_name).join(', ')}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="font-bold text-sm text-slate-900">{parseFloat(order.total_amount).toLocaleString()} RWF</div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s?.color || 'bg-slate-100 text-slate-500'}`}>{order.status?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PRODUCTS ─────────────────────────────── */}
          {view === "products" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Your Catalog</p>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {showAddProduct
                      ? (editingProductId ? "Edit Product" : "New Product")
                      : `${sellerProducts?.length || 0} Products`}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {showAddProduct ? (
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="gap-2 text-slate-500 rounded-2xl">
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

              {/* ── Add/Edit Form ── */}
              {showAddProduct && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {editingProductId ? <><Edit3 size={20} className="text-amber-500"/> Edit Product</> : <><Sparkles size={20} className="text-amber-500"/> New Product</>}
                    </h2>
                    <button onClick={() => { setShowAddProduct(false); setEditingProductId(null); }} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <X size={15} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="p-6 md:p-8 space-y-10">
                    {/* Section: Product Info */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-5">Product Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Name *</Label>
                          <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Ankara Print Tote Bag" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category *</Label>
                          <Select value={productForm.category} onValueChange={(val) => setProductForm({ ...productForm, category: val })}>
                            <SelectTrigger className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white">
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
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                          <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Tell buyers what makes this product special — material, origin, size, care instructions…"
                            className="rounded-2xl border-slate-200 bg-slate-50 focus:bg-white resize-none" rows={4} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Pricing & Availability */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-5">Pricing & Availability</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price (RWF) *</Label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">RWF</span>
                            <Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="12,500" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white pl-12" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Quantity *</Label>
                          <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                            placeholder="e.g. 10" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white" />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Do you currently have this item in stock? *
                          </Label>
                          <p className="text-xs text-slate-400 -mt-1 mb-2">
                            This sets the delivery label buyers see on your listing.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, in_stock: true })}
                              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 text-sm font-semibold transition-all ${
                                productForm.in_stock === true
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/30"
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
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-blue-50/30"
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
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-5">Product Photos</h3>
                      <div className="space-y-3">
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer group">
                          <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={e => handleImageChange(e.target.files)} />
                          <ImagePlus size={28} className="mx-auto text-slate-300 group-hover:text-amber-400 transition-colors mb-3" />
                          <p className="text-sm font-semibold text-slate-500">
                            {productImages.length > 0 ? `${productImages.length} image(s) selected — click to change` : "Click to upload product photos"}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB each</p>
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
                  <div className="flex gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
                    <Button onClick={handleSaveProduct}
                      disabled={isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-slate-900 text-white rounded-2xl px-8 h-12 font-semibold gap-2 shadow-sm hover:-translate-y-0.5 transition-all">
                      {(isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {editingProductId ? "Update Product" : "Publish Product"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="rounded-2xl px-6 h-12 text-slate-500 font-semibold hover:bg-slate-200">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Product List (always visible when not loading) ── */}
              {isProductsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : !sellerProducts || sellerProducts.length === 0 ? (
                !showAddProduct && (
                  <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                      <Package size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Your store is ready</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Add your first product and start sharing it with thousands of buyers across Rwanda.</p>
                    <Button onClick={() => setShowAddProduct(true)} className="bg-slate-900 text-white rounded-2xl px-8 h-12 gap-2 font-semibold">
                      <Plus size={16} /> Add First Product
                    </Button>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <Package size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-900 text-sm">All Products</span>
                    <span className="ml-auto text-xs font-bold text-slate-400">{sellerProducts.length} listed</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {sellerProducts.map(product => {
                      const img = product.images?.[0]?.image;
                      const inStock = product.stock_quantity > 0;
                      const lowStock = inStock && product.stock_quantity <= 3;
                      const isEditing = editingProductId === String(product.id);
                      return (
                        <div key={product.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          isEditing ? "bg-amber-50/60 border-l-4 border-amber-400" : "hover:bg-slate-50/60"
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
                              <span className="font-bold text-slate-900 truncate">{product.name}</span>
                              {isEditing && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Editing…</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-400">{product.category}</span>
                              <span className="text-slate-300">·</span>
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
                            <div className="font-black text-slate-900">{Number(product.price).toLocaleString()} <span className="text-xs font-bold text-slate-400">RWF</span></div>
                            <div className="text-xs text-slate-400 mt-0.5">{product.stock_quantity} qty</div>
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
                              className="h-9 w-9 rounded-2xl border border-slate-200 bg-white text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors">
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

          {/* ── ORDERS ───────────────────────────────── */}
          {view === "orders" && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Sales Activity</p>
                <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
                <p className="text-slate-500 mt-1">Track and fulfill your customer orders.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <BarChart2 size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900 text-sm">All Orders</span>
                  <span className="ml-auto text-xs font-bold text-slate-400">{REAL_ORDERS.length} order{REAL_ORDERS.length !== 1 ? "s" : ""}</span>
                </div>
                {REAL_ORDERS.length === 0 ? (
                  <div className="px-6 py-20 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                      <ShoppingBag size={28} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">No orders yet</h3>
                    <p className="text-sm text-slate-400 max-w-sm">Once customers start buying from your store, their orders will appear here. Share your store link to get started!</p>
                    {storeUrl && (
                      <button onClick={() => { navigator.clipboard.writeText(`https://${storeUrlDisplay}`); toast.success("Link copied!"); }}
                        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:-translate-y-0.5 transition-all">
                        <Copy size={14} /> Copy Store Link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {REAL_ORDERS.map((order: any) => {
                      const s = statusConfig[order.status];
                      return (
                        <div key={order.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/60 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs text-slate-400 font-mono">#{order.id}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s?.color || 'bg-slate-100 text-slate-500'}`}>{order.status?.replace('_', ' ')}</span>
                            </div>
                            <div className="text-sm text-slate-500">{order.items?.map((i: any) => i.product_name).join(', ')}</div>
                            <div className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="font-black text-slate-900 text-lg">{parseFloat(order.total_amount).toLocaleString()} <span className="text-xs font-bold text-slate-400">RWF</span></span>
                            {order.status === "pending" && (
                              <Button size="sm" onClick={() => updateStatus({ id: order.id, status: 'shipped' })} disabled={isUpdatingOrder} className="bg-slate-900 text-white rounded-2xl text-xs gap-1 h-9 px-4">
                                Mark Shipped <Truck size={12} />
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button size="sm" variant="outline" onClick={() => updateStatus({ id: order.id, status: 'completed' })} disabled={isUpdatingOrder} className="rounded-2xl text-xs gap-1 h-9 px-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                Mark Complete <CheckCircle size={12} />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">Full order management coming soon</h3>
                  <p className="text-sm text-slate-600">Real-time order tracking, buyer messaging, and automated fulfillment tools are in development.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STORE SETTINGS ───────────────────────── */}
          {view === "store-settings" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Configuration</p>
                <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
                <p className="text-slate-500 mt-1">Manage your store identity and public profile.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                {/* Logo */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="relative group cursor-pointer flex-shrink-0">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center hover:border-amber-400 transition-colors">
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
                          fallback={<Store size={32} className="text-slate-300" />}
                        />
                      )}
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                        <ImagePlus size={20} className="text-white" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" id="store_logo_input"
                      onChange={e => e.target.files?.[0] && handleLogoChange(e.target.files[0])} />
                  </div>
                  <div>
                    <Label htmlFor="store_logo_input" className="font-bold text-slate-900 cursor-pointer">Store Logo</Label>
                    <p className="text-sm text-slate-500 mt-1">Click the image to upload a new logo.<br />Recommended: square image, 500×500px, max 10MB.</p>
                  </div>
                </div>

                {/* Store name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Store Name *</Label>
                  <Input value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="rounded-2xl h-12 border-slate-200 bg-slate-50 focus:bg-white font-semibold" />
                </div>

                {/* Store URL (read-only) */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Store URL</Label>
                  <div className="flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden h-12">
                    <span className="flex items-center px-4 text-slate-400 text-sm bg-slate-100 border-r border-slate-200 flex-shrink-0">
                      ubuntunow.rw/store/
                    </span>
                    <input value={storeSlug} readOnly className="bg-transparent px-4 text-sm font-mono text-slate-600 w-full outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Store Description</Label>
                  <Textarea value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })}
                    placeholder="Describe your store — what you sell, your story, your values…"
                    className="rounded-2xl border-slate-200 bg-slate-50 focus:bg-white resize-none" rows={5} />
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
                    <div className="h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                      <Eye size={22} className="text-slate-900" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-0.5">See how your store looks</div>
                      <div className="text-slate-400 text-sm">Preview your public store page with all your products.</div>
                    </div>
                    <ArrowRight size={18} className="text-slate-500" />
                  </div>
                </Link>
              ) : (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex items-center gap-4 opacity-60 cursor-not-allowed">
                  <div className="h-12 w-12 rounded-2xl bg-amber-400/60 flex items-center justify-center flex-shrink-0">
                    {isUserLoading ? <Loader2 size={22} className="text-slate-900 animate-spin" /> : <Eye size={22} className="text-slate-900" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-0.5">{isUserLoading ? "Loading store link…" : "Store link unavailable"}</div>
                    <div className="text-slate-400 text-sm">Your store URL will appear here once your profile has loaded.</div>
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
