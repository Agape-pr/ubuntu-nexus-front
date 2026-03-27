"use client";

import kigaliSkyline from "@/assets/kigali-skyline.jpg";
import kigaliMarket from "@/assets/kigali-market.jpg";
import kigaliSeller from "@/assets/kigali-seller.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProducts } from "@/lib/api/hooks/useProducts";
import {
  ArrowRight, Store, ShieldCheck, Zap, Star, MapPin, 
  CheckCircle, ThumbsUp, CreditCard, PackageCheck, Sparkles 
} from "lucide-react";

export default function Index() {
  const { data: products = [], isLoading } = useProducts();
  const recentProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* 1. HERO - Split Layout */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -m-32 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-2xl animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
                <Sparkles size={14} className="text-accent" />
                <span>The new era of local commerce</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-foreground leading-[1.05] mb-6 text-balance">
                Buy and sell with{" "}
                <span className="relative inline-block text-primary">
                  people you trust
                  <svg className="absolute -bottom-2 left-0 w-full text-accent/40" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00049 6.84039C50.0005 1.84039 120.501 -2.15961 198.001 6.84039" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Start selling online in minutes. Discover unique products from your neighbors, and shop securely with our 2-hour escrow guarantee.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/auth?tab=register&role=seller">
                  <Button size="lg" className="w-full sm:w-auto gradient-amber text-white font-semibold px-8 h-14 rounded-2xl shadow-amber hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-0">
                    Start your store <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all duration-300">
                    Explore marketplace
                  </Button>
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald" />
                  <span className="font-medium text-foreground">100% Secure</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {["🧑🏿", "👩🏾", "👨🏿"].map((emoji, i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] z-10 shadow-sm">{emoji}</div>
                    ))}
                  </div>
                  <span className="ml-1"><strong className="text-foreground">2.4k+</strong> locals</span>
                </div>
              </div>
            </div>

            {/* Right Images Collage */}
            <div className="relative h-[450px] lg:h-[600px] w-full lg:w-[110%] animate-slide-in-right hidden md:block">
              {/* Main abstract backdrop */}
              <div className="absolute inset-0 rounded-3xl bg-secondary transform rotate-3" />
              
              {/* Primary Image */}
              <div className="absolute top-4 left-4 right-12 bottom-12 rounded-3xl overflow-hidden shadow-lift border-4 border-card group bg-secondary">
                <img src={kigaliMarket.src} alt="Kigali Market" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Live</span>
                  </div>
                  <p className="text-xl font-bold">Kigali local vendors</p>
                </div>
              </div>

              {/* Floating Element 1 - Small Image */}
              <div className="absolute -bottom-6 -left-6 h-48 w-40 rounded-2xl overflow-hidden shadow-ambient border-4 border-card z-20 group bg-secondary">
                <img src={kigaliSeller.src} alt="Seller" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Floating Element 2 - Glassmorphism Badge */}
              <div className="absolute top-12 -right-8 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-lift border border-border/50 z-30 animate-float flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Within 2 hours</p>
                </div>
              </div>
              
              {/* Floating Element 3 - Rating Card */}
              <div className="absolute bottom-24 -right-2 bg-card p-3 rounded-2xl shadow-lift border border-border z-30 animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={12} className="fill-accent text-accent" />)}
                </div>
                <p className="text-xs font-medium text-foreground">"Best platform ever!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENTO BOX FEATURES & MOSAIC */}
      <section className="py-20 bg-secondary/30 relative">
        <div className="container">
          <div className="mb-12 md:mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Why we're different</h2>
            <p className="text-muted-foreground text-lg max-w-xl">Everything you need to buy and sell confidently, built into one cohesive experience designed for the African market.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            
            {/* Bento 1: Large Image (Community) - spans 2 cols, 2 rows */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl relative overflow-hidden group shadow-card bg-secondary">
              <img src={kigaliSkyline.src} alt="Kigali Skyline" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-3">
                  <MapPin size={12} /> Kigali, Rwanda
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Built for our community</h3>
                <p className="text-white/80 line-clamp-2 max-w-md">Connect with sellers in your neighborhood. Support local businesses and grow the circular economy effortlessly.</p>
              </div>
            </div>

            {/* Bento 2: Buyer Protection - spans 2 cols */}
            <div className="md:col-span-1 lg:col-span-2 rounded-3xl bg-emerald/10 border border-emerald/20 p-6 md:p-8 flex flex-col justify-end relative shadow-sm group hover:bg-emerald/15 transition-colors">
              <div className="absolute top-6 right-6 md:top-8 md:right-8 h-12 w-12 rounded-2xl bg-emerald/20 flex items-center justify-center text-emerald group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold text-emerald-foreground mb-2">100% Escrow Protection</h3>
              <p className="text-emerald-foreground/80 max-w-sm">Your money stays in a secure vault until your order arrives perfectly. Not what you ordered? Instant refund.</p>
            </div>

            {/* Bento 3: Fast Setup */}
            <div className="rounded-3xl bg-card border border-border p-6 flex flex-col justify-between shadow-sm group hover:shadow-ambient transition-all">
              <Store size={28} className="text-primary group-hover:-translate-y-1 transition-transform" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Instant Storefront</h3>
                <p className="text-sm text-muted-foreground">Sign up, add products, get a shareable link in exactly 2 minutes.</p>
              </div>
            </div>

            {/* Bento 4: Pesapal */}
            <div className="rounded-3xl bg-primary border-transparent p-6 flex flex-col justify-between shadow-lift group z-10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <Zap size={28} className="text-accent group-hover:scale-110 transition-transform relative z-10" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1">Mobile Money Ready</h3>
                <p className="text-sm text-white/70">Powered securely by Pesapal for seamless local transactions.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="py-20 md:py-28 bg-background overflow-hidden relative">
        {/* Subtle background curved lines */}
        <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[600px] text-secondary -z-10" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none">
          <path d="M0 300C300 300 400 100 700 100C1000 100 1000 300 1200 300" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

        <div className="container">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">The journey of a sale</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Transparent from click to delivery. No surprises.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-border -z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
              {[
                {
                  step: "01", title: "Order Placed", 
                  desc: "Buyer pays securely into UbuntuNow's escrow vault.", 
                  icon: CreditCard, color: "text-primary", bg: "bg-primary/10"
                },
                {
                  step: "02", title: "Order Delivered", 
                  desc: "Seller delivers the item. The 2-hour inspection clock begins.", 
                  icon: PackageCheck, color: "text-accent", bg: "bg-accent/10"
                },
                {
                  step: "03", title: "Funds Released", 
                  desc: "Buyer approves item. Escrow instantly releases funds to seller.", 
                  icon: ThumbsUp, color: "text-emerald", bg: "bg-emerald/10"
                }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className={`w-32 h-32 rounded-full ${step.bg} border-8 border-background flex items-center justify-center relative shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    <step.icon size={40} className={step.color} />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-card border border-border font-bold text-foreground flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="mt-8 mb-2 font-bold text-xl text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-[250px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="py-20 bg-secondary/80">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Fresh from Kigali</h2>
              <p className="text-muted-foreground mt-2">Discover curated local products</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="rounded-full bg-card hover:bg-secondary gap-2 transition-all border-border shadow-sm hover:shadow-md">
                View marketplace <ArrowRight size={15} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-20 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                Loading fresh products...
              </div>
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.images?.[0]?.image}
                  storeName={product.store_name}
                  storeSlug={product.store_name?.toLowerCase().replace(/\s+/g, '-')}
                  category={product.category_name}
                  inStock={product.stock_quantity > 0}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-20 bg-card rounded-3xl border border-dashed border-border shadow-sm">
                <div className="text-4xl mb-3">🛍️</div>
                <p>No products featured yet. Be the first to add one!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SELLER CTA MODAL STYLE */}
      <section className="py-20 md:py-32 bg-background relative overflow-hidden flex items-center justify-center">
        {/* Large abstract gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

        <div className="container relative z-10 max-w-5xl mx-auto">
          <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 text-center shadow-lift relative overflow-hidden group">
            {/* CTA Decorative lines */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 text-balance">
                Launch your business<br className="hidden md:block"/> on UbuntuNow.
              </h2>
              <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
                Zero set-up fees. Reach thousands of local buyers. Complete escrow protection. Your storefront awaits.
              </p>
              <div className="flex justify-center">
                <Link href="/auth?tab=register&role=seller">
                  <Button size="lg" className="gradient-amber text-primary font-bold px-10 h-16 text-lg rounded-full shadow-amber hover:scale-105 transition-transform duration-300 border-0">
                    Create your free store
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-sm text-white/50 flex flex-wrap justify-center gap-6">
                <span className="flex items-center gap-2"><CheckCircle size={15}/> 2-min setup</span>
                <span className="flex items-center gap-2"><CheckCircle size={15}/> No hidden fees</span>
                <span className="flex items-center gap-2"><CheckCircle size={15}/> Local community</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
