import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Package,
  TrendingUp,
  Settings,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle,
  Edit3,
  Trash2,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { useCreateProduct } from "@/lib/api/hooks/useProducts";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";
import { toast } from "sonner";

type DashView = "overview" | "products" | "orders" | "store-settings";

const MOCK_PRODUCTS = [
  { id: "1", name: "Ankara Print Tote Bag", price: 12500, stock: 8, status: "active" },
  { id: "2", name: "Hand-Embroidered Table Runner", price: 9500, stock: 3, status: "active" },
  { id: "3", name: "Beaded Necklace Set", price: 7000, stock: 0, status: "out-of-stock" },
];

const MOCK_ORDERS = [
  { id: "ORD-001", customer: "Jean Pierre N.", product: "Ankara Print Tote Bag", amount: 12500, status: "pending", date: "2025-02-18" },
  { id: "ORD-002", customer: "Amina U.", product: "Hand-Embroidered Table Runner", amount: 9500, status: "shipped", date: "2025-02-17" },
  { id: "ORD-003", customer: "Eric K.", product: "Beaded Necklace Set", amount: 7000, status: "completed", date: "2025-02-15" },
];

const STATS = [
  { label: "Total sales", value: "29,000 RWF", icon: TrendingUp, color: "text-emerald" },
  { label: "Active products", value: "2", icon: Package, color: "text-primary" },
  { label: "Orders this month", value: "3", icon: ShoppingBag, color: "text-accent" },
  { label: "Store views", value: "142", icon: Eye, color: "text-muted-foreground" },
];

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  shipped: "bg-secondary text-secondary-foreground",
  completed: "bg-emerald/10 text-emerald",
  "out-of-stock": "bg-destructive/10 text-destructive",
  active: "bg-green-50 text-emerald",
};

const SellerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'seller') {
      navigate('/marketplace');
    }
  }, [navigate]);

  const { data: userProfile, isLoading: isUserLoading } = useCurrentUser();

  const [view, setView] = useState<DashView>("overview");
  const [copied, setCopied] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    category: "",
    description: "",
  });

  const createProductMutation = useCreateProduct();

  const handleCreateProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.stock_quantity || !productForm.category) {
      toast.error("Please fill in all required fields (Name, Price, Stock, Category).");
      return;
    }

    createProductMutation.mutate(
      {
        name: productForm.name,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity),
        // For testing/mocking we'll hardcode category 1 if not string.
        category: 1, // Ideally we'd fetch categories and use IDs
        description: productForm.description,
        is_active: true,
        uploaded_images: productImages.length > 0 ? productImages : undefined,
      },
      {
        onSuccess: () => {
          setShowAddProduct(false);
          setProductForm({ name: "", price: "", stock_quantity: "", category: "", description: "" });
          setProductImages([]);
        },
      }
    );
  };

  // Extract store details from API or fallback to placeholder
  const storeName = userProfile?.store?.store_name || "Nyirangarama Fashion";
  const storeSlug = userProfile?.store?.slug || "nyirangarama-fashion";
  const storeUrl = `${window.location.origin}/store/${storeSlug}`;
  const storeUrlDisplay = `ubuntunow.com/store/${storeSlug}`;
  const storeInitials = storeName.substring(0, 2).toUpperCase();

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "overview" as DashView, label: "Overview", icon: TrendingUp },
    { id: "products" as DashView, label: "Products", icon: Package },
    { id: "orders" as DashView, label: "Orders", icon: ShoppingBag },
    { id: "store-settings" as DashView, label: "Store settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 min-h-[calc(100vh-64px)] flex-col border-r border-border bg-card sticky top-16">
          {/* Store Identity */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              {userProfile?.store?.store_logo ? (
                <div className="h-10 w-10 rounded-xl border border-border overflow-hidden flex-shrink-0 bg-white">
                  <img src={userProfile.store.store_logo} alt={storeName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                  {storeInitials}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-sm text-foreground truncate" title={storeName}>
                  {isUserLoading ? "Loading..." : storeName}
                </div>
                <div className="text-xs text-muted-foreground">Seller</div>
              </div>
            </div>
            {/* Store link */}
            <div className="p-2.5 rounded-xl bg-secondary text-xs text-muted-foreground flex items-center gap-2">
              <span className="truncate">{storeUrlDisplay}</span>
              <button onClick={copyLink} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <CheckCircle size={13} className="text-emerald" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all duration-200 ${view === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Link to={`/store/${storeSlug}`} target="_blank">
              <Button variant="outline" className="w-full rounded-xl text-xs gap-2">
                <ExternalLink size={13} />
                View my store
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Overview */}
          {view === "overview" && (
            <div className="animate-fade-up">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Welcome back 👋</h1>
                <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border/50 shadow-card">
                    <stat.icon size={18} className={`${stat.color} mb-3`} />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Store link card */}
              <div className="bg-primary rounded-2xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary-foreground/5 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-primary-foreground/60 text-sm mb-3">
                    <Store size={14} />
                    Your store link
                  </div>
                  <div className="text-primary-foreground font-mono text-lg mb-4">{storeUrlDisplay}</div>
                  <div className="flex gap-2">
                    <Button onClick={copyLink} size="sm" className="gradient-amber text-accent-foreground rounded-xl border-0 gap-2">
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy link"}
                    </Button>
                    <Link to={`/store/${storeSlug}`}>
                      <Button size="sm" variant="outline" className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 gap-2">
                        <Eye size={14} />
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-card">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Recent orders</h2>
                  <button onClick={() => setView("orders")} className="text-xs text-accent hover:underline">
                    View all
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-sm text-foreground">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.product}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm text-foreground">{order.amount.toLocaleString()} RWF</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {view === "products" && (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Products</h1>
                  <p className="text-muted-foreground mt-1">{MOCK_PRODUCTS.length} products in your store</p>
                </div>
                <Button className="rounded-xl gap-2" onClick={() => setShowAddProduct(!showAddProduct)}>
                  <Plus size={16} />
                  Add product
                </Button>
              </div>

              {/* Add product form */}
              {showAddProduct && (
                <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6 animate-fade-up">
                  <h3 className="font-semibold text-foreground mb-5">New product</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Product name</Label>
                      <Input
                        placeholder="e.g. Ankara Tote Bag"
                        className="mt-1.5 rounded-xl"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Price (RWF)</Label>
                      <Input
                        type="number"
                        placeholder="12500"
                        className="mt-1.5 rounded-xl"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Stock quantity</Label>
                      <Input
                        type="number"
                        placeholder="10"
                        className="mt-1.5 rounded-xl"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full h-10 mt-1.5 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="" disabled>Select a category</option>
                        {["Fashion", "Food", "Crafts", "Beauty", "Tech", "Books", "Home"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe your product..."
                        className="mt-1.5 rounded-xl resize-none"
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Product images</Label>
                      <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-ring transition-colors relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArr = Array.from(e.target.files);
                              setProductImages(filesArr);
                            } else {
                              setProductImages([]);
                            }
                          }}
                        />
                        <div className="text-2xl mb-2">📷</div>
                        <p className="text-sm text-muted-foreground">Click to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {productImages.length > 0
                            ? `${productImages.length} image(s) selected`
                            : "PNG, JPG up to 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <Button
                      className="rounded-xl"
                      onClick={handleCreateProduct}
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                      Save product
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowAddProduct(false)} disabled={createProductMutation.isPending}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl border border-border/50 shadow-card">
                <div className="divide-y divide-border">
                  {MOCK_PRODUCTS.map((product) => (
                    <div key={product.id} className="p-5 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                        🛍️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.price.toLocaleString()} RWF</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[product.status]}`}>
                            {product.status === "out-of-stock" ? "Out of stock" : "Active"}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                          {product.stock <= 3 && product.stock > 0 && (
                            <span className="text-xs text-accent flex items-center gap-1">
                              <AlertCircle size={11} /> Low stock
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                          <Edit3 size={14} />
                        </button>
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {view === "orders" && (
            <div className="animate-fade-up">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Orders</h1>
                <p className="text-muted-foreground mt-1">Manage and track your incoming orders</p>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 shadow-card">
                <div className="divide-y divide-border">
                  {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                          <div className="font-semibold text-foreground mt-0.5">{order.customer}</div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">{order.product}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{order.amount.toLocaleString()} RWF</span>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button size="sm" className="h-8 rounded-xl text-xs">
                              Mark as shipped
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button size="sm" className="h-8 rounded-xl text-xs">
                              Mark as completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Store settings */}
          {view === "store-settings" && (
            <div className="animate-fade-up">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Store settings</h1>
                <p className="text-muted-foreground mt-1">Manage your store identity and details</p>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 max-w-2xl">
                <div className="space-y-5">
                  <div>
                    <Label>Store name</Label>
                    <Input value={storeName} readOnly className="mt-1.5 rounded-xl bg-secondary/50" />
                  </div>
                  <div>
                    <Label>Store URL</Label>
                    <div className="flex mt-1.5">
                      <div className="px-3 h-10 flex items-center bg-secondary border border-border border-r-0 rounded-l-xl text-sm text-muted-foreground flex-shrink-0">
                        ubuntunow.com/store/
                      </div>
                      <Input value={storeSlug} readOnly className="rounded-l-none rounded-r-xl bg-secondary/50" />
                    </div>
                  </div>
                  <div>
                    <Label>Store description</Label>
                    <Textarea
                      defaultValue={userProfile?.store?.store_description || "Handcrafted African fashion made with love in Kigali. Authentic Ankara prints, embroidered accessories, and more."}
                      className="mt-1.5 rounded-xl resize-none"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input defaultValue="Kigali, Rwanda" className="mt-1.5 rounded-xl" />
                  </div>
                  <Button className="rounded-xl">Save changes</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
