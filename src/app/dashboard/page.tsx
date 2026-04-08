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
  Tag, X, ImagePlus, ArrowRight, Sparkles, BarChart2, Star,
} from "lucide-react";
import { useCreateProduct, useUpdateProduct, useCategories, useSellerProducts } from "@/lib/api/hooks/useProducts";
import { createCategory } from "@/lib/api/services/products";
import { useCurrentUser, useUpdateStore } from "@/lib/api/hooks/useUsers";
import { toast } from "sonner";
import { CloudImage } from "@/components/ui/CloudImage";

type DashView = "overview" | "products" | "orders" | "store-settings";

// Orders will come from the API in the future
const REAL_ORDERS: never[] = [];

// Curated category suggestions for African marketplace sellers
const CATEGORY_SUGGESTIONS = [
  "Fashion & Clothing", "Handmade Crafts", "Jewelry & Accessories",
  "Home Décor", "Art & Paintings", "Food & Spices", "Beauty & Skincare",
  "Bags & Leather", "Fabrics & Textiles", "Electronics", "Books",
  "Toys & Games", "Sports & Outdoors", "Health & Wellness",
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
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const { data: userProfile, isLoading: isUserLoading } = useCurrentUser();
  const { data: categories } = useCategories();
  const { data: sellerProducts, isLoading: isProductsLoading } = useSellerProducts();

  const [productForm, setProductForm] = useState({
    name: "", price: "", stock_quantity: "", category: "", description: "",
  });
  const [storeForm, setStoreForm] = useState({ name: "", description: "" });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

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

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategorySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

    setIsSavingProduct(true);
    let categoryId = Number(productForm.category);

    try {
      // Check if the selected category actually exists in the backend
      const isRealCategory = categories?.some(c => c.id === categoryId);
      
      if (!isRealCategory) {
        // It's a fake mock category or typed name, we must create it first to avoid 'Invalid pk' error
        const fakeSug = CATEGORY_SUGGESTIONS[categoryId - 1];
        const categoryName = fakeSug || productForm.category;
        const newCat = await createCategory(categoryName);
        categoryId = newCat.id;
      }

      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity),
        category: categoryId,
        description: productForm.description,
        is_active: true,
        uploaded_images: productImages.length > 0 ? productImages : undefined,
      };

      const opts = {
        onSuccess: () => {
          setShowAddProduct(false);
          setEditingProductId(null);
          setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "" });
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
      toast.error(e.message || "Failed to resolve category. Please try again.");
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id.toString());
    setProductForm({
      name: product.name, price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category.toString(),
      description: product.description || "",
    });
    setProductImages([]);
    setProductImagePreviews([]);
    setShowAddProduct(true);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const storeName = userProfile?.store?.store_name || "My Store";
  const storeSlug = userProfile?.store?.slug || "";
  const storeUrl = storeSlug ? `https://www.ubuntunow.rw/store/${storeSlug}` : null;
  const storeUrlDisplay = storeSlug
    ? `www.ubuntunow.rw/store/${storeSlug}`
    : isUserLoading
    ? "Loading your store link…"
    : "www.ubuntunow.rw/store/your-store";
  const storeInitials = storeName.substring(0, 2).toUpperCase();
  const activeProductsCount = sellerProducts?.filter(p => p.is_active).length || 0;

  // Filtered category suggestions
  const filteredSuggestions = (categories && categories.length > 0 ? categories.map(c => ({ id: c.id, name: c.name })) : CATEGORY_SUGGESTIONS.map((name, i) => ({ id: i + 1, name }))).filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectedCategoryName = categories?.find(c => c.id === Number(productForm.category))?.name
    || CATEGORY_SUGGESTIONS[Number(productForm.category) - 1]
    || productForm.category;

  const navItems = [
    { id: "overview" as DashView, label: "Overview", icon: LayoutDashboard },
    { id: "products" as DashView, label: "My Products", icon: Package },
    { id: "orders" as DashView, label: "Orders", icon: ShoppingBag },
    { id: "store-settings" as DashView, label: "Store Settings", icon: Settings },
  ];

  const totalRevenue = REAL_ORDERS.reduce((sum: number, order: any) => sum + (order?.amount || 0), 0);

  const STATS = [
    { label: "Active Listings", value: isProductsLoading ? "…" : String(activeProductsCount), sub: "Across your store", icon: Package, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Store Views", value: "0", sub: "Analytics coming soon", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Orders", value: String(REAL_ORDERS.length), sub: REAL_ORDERS.length === 0 ? "No orders yet" : `${REAL_ORDERS.length} order${REAL_ORDERS.length !== 1 ? "s" : ""}`, icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Revenue", value: `${totalRevenue.toLocaleString()} RWF`, sub: totalRevenue === 0 ? "No revenue yet" : "All time", icon: Wallet, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

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
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">

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
                        <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm ${statusBg[order.status] || "bg-slate-100"}`}>
                            {statusEmoji[order.status] || "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900">{order.customer}</div>
                            <div className="text-xs text-slate-400 truncate">{order.product}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm text-slate-900">{order.amount.toLocaleString()} RWF</div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
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
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Your Catalog</p>
                  <h1 className="text-3xl font-bold text-slate-900">{sellerProducts?.length || 0} Products</h1>
                </div>
                {!showAddProduct && (
                  <Button onClick={() => { setEditingProductId(null); setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "" }); setProductImages([]); setProductImagePreviews([]); setShowAddProduct(true); }}
                    className="bg-slate-900 text-white rounded-2xl px-6 h-11 gap-2 font-semibold shadow-md hover:-translate-y-0.5 transition-all">
                    <Plus size={16} /> Add Product
                  </Button>
                )}
              </div>

              {/* ── Add/Edit Form ── */}
              {showAddProduct && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-fade-up">
                  <div className="flex items-center justify-between mb-7">
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingProductId ? "✏️ Edit Product" : "✨ New Product"}
                    </h2>
                    <button onClick={() => { setShowAddProduct(false); setEditingProductId(null); }} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <X size={15} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product name */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Name *</Label>
                      <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Ankara Print Tote Bag" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white" />
                    </div>

                    {/* Category with suggestions */}
                    <div className="space-y-2" ref={categoryRef}>
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category *</Label>
                      <div className="relative">
                        <div className="relative">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={productForm.category ? selectedCategoryName : categorySearch}
                            onChange={e => {
                              setCategorySearch(e.target.value);
                              setProductForm({ ...productForm, category: "" });
                              setShowCategorySuggestions(true);
                            }}
                            onFocus={() => setShowCategorySuggestions(true)}
                            placeholder="Search or pick a category..."
                            className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white pl-9 pr-8"
                          />
                          {productForm.category && (
                            <button onClick={() => { setProductForm({ ...productForm, category: "" }); setCategorySearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {/* Dropdown */}
                        {showCategorySuggestions && !productForm.category && (
                          <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                            {filteredSuggestions.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-slate-400">No categories found</div>
                            ) : (
                              filteredSuggestions.map(c => (
                                <button key={c.id} onClick={() => { setProductForm({ ...productForm, category: String(c.id) }); setCategorySearch(c.name); setShowCategorySuggestions(false); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Tag size={12} className="text-slate-400" /> {c.name}
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        {/* Quick-pick chips */}
                        {!productForm.category && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {["Fashion & Clothing", "Handmade Crafts", "Jewelry & Accessories", "Home Décor", "Art & Paintings"].map(name => {
                              const match = filteredSuggestions.find(c => c.name === name);
                              if (!match) return null;
                              return (
                                <button key={name} onClick={() => { setProductForm({ ...productForm, category: String(match.id) }); setCategorySearch(name); setShowCategorySuggestions(false); }}
                                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 text-[11px] font-semibold transition-colors border border-transparent hover:border-amber-200">
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price (RWF) *</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">RWF</span>
                        <Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="12,500" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white pl-12" />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Quantity *</Label>
                      <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                        placeholder="e.g. 10" className="rounded-2xl h-11 border-slate-200 bg-slate-50 focus:bg-white" />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                      <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Tell buyers what makes this product special — material, origin, size, care instructions…"
                        className="rounded-2xl border-slate-200 bg-slate-50 focus:bg-white resize-none" rows={4} />
                    </div>

                    {/* Images */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Photos</Label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer group">
                        <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={e => handleImageChange(e.target.files)} />
                        <ImagePlus size={28} className="mx-auto text-slate-300 group-hover:text-amber-400 transition-colors mb-3" />
                        <p className="text-sm font-semibold text-slate-500">
                          {productImages.length > 0 ? `${productImages.length} image(s) selected — click to change` : "Click to upload product photos"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB each</p>
                      </div>
                      {/* Previews */}
                      {productImagePreviews.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {productImagePreviews.map((src, i) => (
                            <div key={i} className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                    <Button onClick={handleSaveProduct}
                      disabled={isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-slate-900 text-white rounded-2xl px-8 h-11 font-semibold gap-2">
                      {(isSavingProduct || createProductMutation.isPending || updateProductMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {editingProductId ? "Update Product" : "Publish Product"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddProduct(false); setEditingProductId(null); }}
                      className="rounded-2xl px-6 h-11 text-slate-500 font-semibold">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Product Grid ── */}
              {isProductsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : !sellerProducts || sellerProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                  <img src="/illustrations/no-products.png" alt="No products" className="h-48 w-auto mx-auto mb-6 drop-shadow-md" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Your store is ready</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">Add your first product and start sharing it with thousands of buyers across Rwanda.</p>
                  <Button onClick={() => setShowAddProduct(true)} className="bg-slate-900 text-white rounded-2xl px-8 h-12 gap-2 font-semibold">
                    <Plus size={16} /> Add First Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sellerProducts.map(product => {
                    const img = product.images?.[0]?.image;
                    const inStock = product.stock_quantity > 0;
                    const lowStock = inStock && product.stock_quantity <= 3;
                    return (
                      <div key={product.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                        <div className="h-52 relative bg-slate-50 overflow-hidden">
                          {img ? (
                            <CloudImage 
                              publicId={img} 
                              alt={product.name} 
                              width={400} 
                              height={400} 
                              crop="fill"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              fallback={<div className="w-full h-full flex items-center justify-center text-5xl bg-slate-100">🛍️</div>}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
                          )}
                          {/* Status badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${inStock ? statusConfig.active.color : statusConfig["out-of-stock"].color}`}>
                              {inStock ? "Active" : "Out of stock"}
                            </span>
                          </div>
                          {lowStock && (
                            <div className="absolute top-3 right-3">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <AlertCircle size={10} /> Low
                              </span>
                            </div>
                          )}
                          {/* Edit button */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => handleEditClick(product)}
                              className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-amber-50 transition-colors">
                              <Edit3 size={15} className="text-slate-700" />
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-slate-900 truncate mb-1">{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-600 font-black text-lg">{Number(product.price).toLocaleString()} <span className="text-xs font-bold text-slate-400">RWF</span></span>
                            <span className="text-xs text-slate-400">{product.stock_quantity} in stock</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                              <span className="text-xs text-slate-400 font-mono">{order.id}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                            </div>
                            <div className="font-bold text-slate-900">{order.customer}</div>
                            <div className="text-sm text-slate-500">{order.product}</div>
                            <div className="text-xs text-slate-400 mt-1">{order.date}</div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="font-black text-slate-900 text-lg">{order.amount.toLocaleString()} <span className="text-xs font-bold text-slate-400">RWF</span></span>
                            {order.status === "pending" && (
                              <Button size="sm" className="bg-slate-900 text-white rounded-2xl text-xs gap-1 h-9 px-4">
                                Mark Shipped <ArrowRight size={12} />
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button size="sm" variant="outline" className="rounded-2xl text-xs gap-1 h-9 px-4 border-emerald-200 text-emerald-700">
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
