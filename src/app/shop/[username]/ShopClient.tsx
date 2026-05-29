"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  Share2, 
  Search, 
  Filter, 
  ArrowLeft,
  CheckCircle2,
  Heart
} from "lucide-react";

export default function ShopClient({ store, initialProducts, username }: { store: any, initialProducts: any[], username: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  const formattedUsername = store?.store_name || (username ? username.replace(/-/g, ' ') : "Store");
  
  // Filter products by search query
  const products = initialProducts.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] pb-24 selection:bg-[#B87800]/30">
      {/* 1. SHOP HEADER & COVER */}
      <div className="relative h-[240px] md:h-[320px] w-full overflow-hidden">
        {/* Abstract dark gradient cover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A19] via-[#2A1F10] to-[#111110]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B87800]/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        {/* Navigation Bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
          <Link href="/" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors">
              <Search size={18} className="text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SHOP INFO SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 z-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#1A1A19] border-4 border-[#111110] shadow-2xl flex-shrink-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#B87800] to-[#FFB340] opacity-80 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
            <img 
              src={store?.store_logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`} 
              alt={formattedUsername}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2 capitalize">
                  {formattedUsername}
                  <CheckCircle2 size={24} className="text-[#B87800]" fill="currentColor" stroke="#111110" />
                </h1>
                <p className="text-[#888780] mt-1 flex items-center gap-1.5 text-sm font-medium">
                  @{username} <span className="mx-1">•</span>
                  <MapPin size={14} /> {store?.location || "Kigali, Rwanda"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-2 sm:mt-0">
                <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Heart size={16} /> Follow
                </button>
                <button className="flex-1 sm:flex-none px-8 py-2.5 rounded-full bg-[#B87800] text-[#111110] hover:bg-[#F0B800] font-black text-sm transition-all shadow-lg shadow-[#B87800]/20">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-white/10 pb-8 mb-8">
          <div className="lg:col-span-2">
            <p className="text-[#A0A09A] leading-relaxed">
              {store?.store_description || "Welcome to our official UbuntuNow storefront! We specialize in premium products crafted with care and sourced sustainably. Follow us for the latest drops and exclusive discounts."}
            </p>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex flex-col">
                <span className="font-black text-xl text-white">4.9</span>
                <span className="text-[#888780] flex items-center gap-1"><Star size={12} className="text-[#B87800] fill-[#B87800]"/> Rating</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="font-black text-xl text-white">{initialProducts.length}</span>
                <span className="text-[#888780]">Products</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="font-black text-xl text-white">8.2k</span>
                <span className="text-[#888780]">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. STOREFRONT CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold w-full sm:w-auto">Latest Collection</h2>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780]" />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A19] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#B87800] transition-colors placeholder:text-[#555]"
              />
            </div>
            <button className="p-2 rounded-full bg-[#1A1A19] border border-white/10 hover:bg-white/10 transition-colors text-[#888780]">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* 4. PRODUCT GRID */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#1A1A19] rounded-2xl border border-white/5">
            <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-[#888780]">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: any) => (
              <div key={product.id || product.slug} className="group flex flex-col">
                {/* Product Image Container */}
                <div className="relative aspect-[4/5] rounded-2xl bg-[#1A1A19] border border-white/5 overflow-hidden mb-3">
                  <img 
                    src={product.image || product.images?.[0]?.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.name}`} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Out of Stock Overlay */}
                  {product.in_stock === false && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full font-bold text-xs uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Quick Add Button (Hover) */}
                  {(product.in_stock !== false) && (
                    <div className="absolute bottom-3 left-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      {/* Clicking Buy Now passes a redirectTo param so login redirects back here */}
                      <Link href={`/login?redirectTo=/shop/${username}/product/${product.slug || product.id}`} className="w-full py-2.5 bg-white/90 backdrop-blur text-black font-bold rounded-xl text-sm hover:bg-white flex items-center justify-center gap-2 shadow-lg shadow-black/20">
                        <ShoppingBag size={16} /> Buy Now
                      </Link>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col flex-1">
                  <h3 className="font-medium text-[15px] leading-snug text-white/90 group-hover:text-white transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-bold text-[#B87800]">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
