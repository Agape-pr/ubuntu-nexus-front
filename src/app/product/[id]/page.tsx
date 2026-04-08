"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import { useProduct } from "@/lib/api/hooks/useProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { CloudImage } from "@/components/ui/CloudImage";
import { toast } from "sonner";
import { 
  ArrowLeft, Star, Heart, Store, Truck, 
  MapPin, Clock, Share2, Plus, Minus, CheckCircle, Info
} from "lucide-react";

// SEED DATA FALLBACK
const SEED_PRODUCTS = [
  { id: "seed-1", name: "Ankara Print Tote Bag", price: 12500, category: "Bags & Leather", image: "/products/ankara-bag.png", storeName: "Kigali Crafts", storeSlug: "kigali-crafts", inStock: true, description: "A beautifully handcrafted Ankara print tote bag perfect for everyday use. Made with durable local fabric and genuine leather straps. Features an interior zipper pocket and magnetic snap closure." },
  { id: "seed-2", name: "Handmade Beaded Necklace Set", price: 8500, category: "Jewelry & Accessories", image: "/products/beaded-necklace.png", storeName: "Umucyo Jewels", storeSlug: "umucyo-jewels", inStock: true, description: "Traditional Rwandan beaded necklace set with matching earrings. Intricately woven patterns reflecting the local heritage. Lightweight and perfect for special occasions." },
  { id: "seed-3", name: "Organic Shea Butter Cream", price: 5500, category: "Beauty & Skincare", image: "/products/shea-butter.png", storeName: "Uruto Organics", storeSlug: "uruto-organics", inStock: true, description: "100% pure unrefined shea butter whipped with soothing essential oils. Sourced directly from local women's cooperatives. Deeply moisturizing and great for sensitive skin." },
  { id: "seed-4", name: "Rwanda Single-Origin Coffee", price: 7000, category: "Food & Spices", image: "/products/coffee.png", storeName: "Akagera Roasters", storeSlug: "akagera-roasters", inStock: true, description: "Premium Bourbon arabica whole beans from the volcanic slopes of Northern Rwanda. Features tasting notes of black tea, orange blossom, and a hint of dark chocolate." },
  { id: "seed-5", name: "Traditional Peace Basket", price: 15000, category: "Handmade Crafts", image: "/products/basket.png", storeName: "Inzozi Baskets", storeSlug: "inzozi-baskets", inStock: true, description: "Also known as an Agaseke, this iconic Rwandan peace basket is tightly handwoven from sisal and sweetgrass. A beautiful symbol of unity and hope for your living room." },
  { id: "seed-6", name: "Hand-Carved Wood Sculpture", price: 22000, category: "Art & Paintings", image: "/products/wood-carving.png", storeName: "Ubumuntu Arts", storeSlug: "ubumuntu-arts", inStock: true, description: "Solid mahogany wood carving depicting traditional Rwandan life. Hand-sanded and polished with natural beeswax. A stunning centerpiece standing at 12 inches tall." },
];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = String(params.id || '');
  const isSeed = idStr.startsWith('seed-');

  const { data: apiProduct, isLoading: isApiLoading } = useProduct(isSeed ? '' : idStr);
  const addItem = useCartStore(state => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine Product Data
  let product: any = null;
  let isLoading = false;

  if (isSeed) {
    product = SEED_PRODUCTS.find(p => p.id === idStr);
    if (product) {
      // adapt properties to match API visually
      product = {
        ...product,
        images: [{ image: product.image }],
        stock_quantity: 10,
        store: { store_name: product.storeName, slug: product.storeSlug }
      };
    }
  } else {
    isLoading = isApiLoading;
    product = apiProduct;
  }

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="rounded-3xl h-[400px] md:h-[600px] bg-secondary animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 bg-secondary w-1/4 rounded animate-pulse" />
              <div className="h-10 bg-secondary w-3/4 rounded animate-pulse" />
              <div className="h-8 bg-secondary w-1/3 rounded animate-pulse" />
              <div className="space-y-2 pt-6">
                <div className="h-3 bg-secondary w-full rounded animate-pulse" />
                <div className="h-3 bg-secondary w-full rounded animate-pulse" />
                <div className="h-3 bg-secondary w-2/3 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Not Found
  if (!product && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container flex items-center justify-center flex-col py-20 text-center">
          <div className="text-6xl mb-6">🏜️</div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Product not found</h2>
          <p className="text-muted-foreground mb-8">This item no longer exists or might have been removed by the seller.</p>
          <Button onClick={() => router.push('/marketplace')}>Browse Marketplace</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Product Data Extraction
  const name = product.name;
  const price = Number(product.price);
  const formattedPrice = new Intl.NumberFormat("en-RW").format(price);
  const stock = Number(product.stock_quantity);
  const description = product.description || "No description provided.";
  const catName = isSeed ? product.category : product.category_name;
  
  const storeName = product.store?.store_name || product.store_name || "Unknown Store";
  const storeSlug = product.store?.slug || product.storeSlug || "";
  
  const imageObj = product.images?.[0];
  const coverImage = isSeed ? imageObj?.image : imageObj?.image;

  const handleAddToCart = () => {
    addItem({
      id: idStr,
      name,
      price,
      image: coverImage,
      storeName,
      quantity,
    });
    toast.success(`${name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart'); // will implement later
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Header */}
        <div className="bg-secondary/30 border-b border-border/50">
          <div className="container py-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
            <span className="text-border">/</span>
            {catName && (
              <>
                <span className="text-foreground">{catName}</span>
                <span className="text-border">/</span>
              </>
            )}
            <span className="text-foreground truncate max-w-[200px]">{name}</span>
          </div>
        </div>

        <div className="container py-10 md:py-16">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-secondary border border-border group shadow-sm">
                {coverImage ? (
                  isSeed ? (
                    <img src={coverImage} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <CloudImage publicId={coverImage} alt={name} crop="fill" fallback={<div className="w-full h-full flex items-center justify-center text-6xl bg-slate-50">🛍️</div>} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                )}
                
                <button className="absolute top-4 right-4 h-12 w-12 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:shadow-lg transition-all shadow-sm border border-border/50">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-6 border-b border-border/50 pb-6">
                <Link href={`/store/${storeSlug}`} className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline mb-2">
                  <Store size={14} /> {storeName}
                </Link>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-4">
                  {name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-accent">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i === 5 ? "text-muted opacity-50" : "fill-current"} />)}
                    </div>
                    <span className="font-medium text-foreground ml-1">4.2</span>
                    <span className="text-muted-foreground">(28 reviews)</span>
                  </div>
                  
                  <div className="w-1 h-1 rounded-full bg-border md:block hidden" />
                  
                  <div className="flex items-center gap-1.5 text-emerald font-medium bg-emerald/10 px-2.5 py-1 rounded-md">
                    <CheckCircle size={14} /> Available
                  </div>
                  
                  <div className="w-1 h-1 rounded-full bg-border md:block hidden" />
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={14} /> Ships from Kigali
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{formattedPrice}</span>
                  <span className="text-xl text-muted-foreground mb-1 font-semibold">RWF</span>
                </div>
                {stock > 0 && stock <= 5 && (
                  <p className="text-rose-500 font-medium text-sm flex items-center gap-1.5 mt-2">
                    <Clock size={14} /> Only {stock} remaining in stock!
                  </p>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="bg-secondary/30 rounded-3xl p-6 border border-border/50 mb-10 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Quantity */}
                  <div className="flex items-center h-14 bg-card rounded-2xl border border-border shadow-sm p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-xl transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="w-12 h-full flex items-center justify-center font-bold text-lg">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-12 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-xl transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Add To Cart */}
                  <Button 
                    onClick={handleAddToCart}
                    disabled={stock < 1}
                    size="lg" 
                    variant="outline" 
                    className="flex-1 h-14 rounded-2xl font-semibold text-base border-border bg-card hover:bg-secondary shadow-sm hover:shadow transition-all"
                  >
                    Add to order
                  </Button>
                </div>
                
                {/* Buy Now Mobile Money */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={stock < 1}
                  size="lg" 
                  className="w-full h-14 rounded-2xl font-bold text-lg gradient-amber text-primary shadow-amber border-0 hover:scale-[1.02] transition-transform"
                >
                  Buy now directly
                </Button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Truck size={14} /> Order now, get it today via Kigali local delivery
                </div>
              </div>

              {/* Payment Badges Component */}
              <PaymentOptions />

              {/* Description */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-foreground mb-4">Product Details</h3>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {description}
                </div>
              </div>

              {/* Share & Report */}
              <div className="mt-10 pt-6 border-t border-border flex items-center justify-between text-sm">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Share2 size={16} /> Share item
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Info size={16} /> Report issue
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
