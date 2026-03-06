import heroImage from "@/assets/kigali-convention.jpeg";
import kigaliSkyline from "@/assets/kigali-skyline.jpg";
import kigaliMarket from "@/assets/kigali-market.jpg";
import kigaliSeller from "@/assets/kigali-seller.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts } from "@/lib/api/hooks/useProducts";
import {
  ArrowRight,
  Store,
  ShieldCheck,
  Users,
  Zap,
  Star,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  ThumbsUp,
  CreditCard,
  PackageCheck
} from "lucide-react";

const FEATURES = [
  {
    icon: Store,
    title: "Easy store setup",
    desc: "Create your store quickly. Get a link to share with your customers instantly.",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: ShieldCheck,
    title: "100% Buyer Protection",
    desc: "Your money stays in escrow. Get what you ordered, or get an instant refund within 2 hours of delivery.",
    color: "bg-emerald text-emerald-foreground",
  },
  {
    icon: Users,
    title: "Local Community",
    desc: "Buy from people you know. Trust and transparency first.",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Zap,
    title: "Powered by Pesapal",
    desc: "Pay securely with Mobile Money or card. Fast, reliable, and trusted across Africa.",
    color: "bg-primary text-primary-foreground",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    role: "Seller",
    title: "Create your store",
    desc: "Sign up and name your store to get your unique link in minutes.",
  },
  {
    step: "02",
    role: "Seller",
    title: "Add your items",
    desc: "Upload photos and set prices. Your store goes live instantly.",
  },
  {
    step: "03",
    role: "Buyer",
    title: "Shop securely",
    desc: "Pay into escrow. Review your delivery within 2 hours to release funds or get refunded.",
  },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const recentProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Full background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Kigali Convention Centre at dusk"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/70 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30" />
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-emerald/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative container py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-md">
              <MapPin size={14} className="text-accent" />
              <span>Launching in Kigali, Rwanda 🇷🇼</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 text-balance drop-shadow-lg">
              Buy and sell locally with{" "}
              <span className="relative inline-block">
                <span className="text-accent drop-shadow-md">people you trust</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/60 rounded-full" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10 drop-shadow-sm backdrop-blur-[2px]">
              Start selling online in minutes. Meet local customers, build your store, and grow your business – all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth?tab=register&role=seller">
                <Button
                  size="lg"
                  className="gradient-amber text-accent-foreground font-semibold px-8 h-14 text-base rounded-2xl shadow-amber hover:scale-105 transition-transform duration-200 border-0"
                >
                  Start selling free
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-2xl border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  Browse marketplace
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              {/* Sellers joined */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["🧑🏿", "👩🏾", "👨🏿", "👩🏽"].map((emoji, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star size={13} className="fill-accent text-accent" />
                  <span className="text-white/70 text-sm">
                    <strong className="text-white">2,400+</strong> sellers joined
                  </span>
                </div>
              </div>

              {/* Escrow badge */}
              <div className="hidden sm:block w-px h-8 bg-white/20 mx-2" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald/20 border border-emerald/30 backdrop-blur-sm">
                <ShieldCheck size={16} className="text-emerald" />
                <span className="text-white text-sm font-medium">
                  2-Hour Escrow Protection
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* KIGALI PHOTO MOSAIC */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium text-muted-foreground mb-4">
              <MapPin size={13} className="text-accent" />
              Kigali, Rwanda 🇷🇼
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Made in Kigali
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A platform built by Rwandans, for Rwandans. Connecting local sellers with local buyers easily.
            </p>
          </div>

          {/* Photo mosaic grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[480px]">
            {/* Large left image */}
            <div className="md:col-span-2 rounded-3xl overflow-hidden shadow-lift relative group">
              <img
                src={kigaliSkyline}
                alt="Kigali skyline at golden hour"
                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-primary-foreground">
                <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-widest mb-1">Kigali CBD</p>
                <p className="text-lg font-bold">Fast growing businesses</p>
              </div>
            </div>

            {/* Right column — two stacked images */}
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl overflow-hidden shadow-lift flex-1 relative group">
                <img
                  src={kigaliMarket}
                  alt="Kigali open market with local sellers"
                  className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-primary-foreground">
                  <p className="text-sm font-bold">Local markets, real connections</p>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lift flex-1 relative group">
                <img
                  src={kigaliSeller}
                  alt="Young Kigali entrepreneur using mobile commerce"
                  className="w-full h-48 md:h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-primary-foreground">
                  <p className="text-sm font-bold">Entrepreneurs on the move</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium text-muted-foreground mb-4">
              <TrendingUp size={13} />
              Why UbuntuNow
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose UbuntuNow
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We built this for our community, making buying and selling straightforward and secure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-border shadow-card hover:shadow-lift transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 shadow-card group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2-HOUR ESCROW BANNER */}
      < section className="py-20 bg-emerald/5 border-y border-border" >
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-card rounded-3xl p-8 md:p-12 shadow-lift border border-emerald/10 relative overflow-hidden">
            {/* Decors */}
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-emerald/10 rounded-full blur-3xl" />

            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald/10 text-emerald text-sm font-bold mb-4">
                <ShieldCheck size={16} />
                Guaranteed safe
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                The 2-Hour Trust Window
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Your money never goes to the seller until you're happy. When your order arrives, our escrow clock starts ticking.
                You have exacty two hours to inspect it.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground/80">
                  <span className="h-6 w-6 rounded-full bg-emerald/20 text-emerald flex items-center justify-center"><CheckCircle size={12} /></span>
                  Love it? Seller gets paid.
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground/80">
                  <span className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center"><CheckCircle size={12} /></span>
                  Not what you bought? Instant refund.
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-background rounded-2xl p-5 border border-border flex flex-col items-center text-center shadow-sm">
                <CreditCard size={28} className="text-primary mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Step 1</span>
                <span className="text-sm font-medium">You pay securely</span>
              </div>
              <div className="bg-background rounded-2xl p-5 border border-border flex flex-col items-center text-center shadow-sm -mt-4">
                <PackageCheck size={28} className="text-emerald mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Step 2</span>
                <span className="text-sm font-medium">Order arrives</span>
              </div>
              <div className="bg-emerald/10 rounded-2xl p-5 border border-emerald/20 flex flex-col items-center text-center shadow-sm">
                <Clock size={28} className="text-emerald mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald/80 mb-1">Step 3</span>
                <span className="text-sm font-medium text-emerald-foreground">2-Hr Inspection</span>
              </div>
              <div className="bg-background rounded-2xl p-5 border border-border flex flex-col items-center text-center shadow-sm -mt-4">
                <ThumbsUp size={28} className="text-accent mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Step 4</span>
                <span className="text-sm font-medium">All good / Refund</span>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* HOW IT WORKS */}
      < section id="how-it-works" className="py-24 bg-secondary/40" >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Start earning quickly. Here's a simple guide for getting started.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-border z-0" />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-card border-2 border-border shadow-card mb-6 mx-auto">
                  <span className="text-3xl font-bold text-accent">{step.step}</span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium mb-3">
                  {step.role}
                </span>
                <h3 className="font-bold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FEATURED PRODUCTS */}
      < section className="py-24 bg-background" >
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-foreground">Fresh from Kigali</h2>
              <p className="text-muted-foreground mt-2">Handpicked products from local sellers</p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="rounded-xl gap-2">
                See all <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p className="col-span-full text-center text-muted-foreground py-10">Loading fresh products...</p>
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
              <p className="col-span-full text-center text-muted-foreground py-10">No products featured yet.</p>
            )}
          </div>
        </div>
      </section >

      {/* SELLER CTA */}
      < section className="py-24 gradient-hero relative overflow-hidden" >
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald/10 blur-3xl" />
        <div className="relative container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to start selling?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Join 2,400+ sellers who are already building their businesses on UbuntuNow. Your store link is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                "No monthly fees",
                "Store link in 2 min",
                "Free to start",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle size={15} className="text-accent flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/auth?tab=register&role=seller">
                <Button
                  size="lg"
                  className="gradient-amber text-accent-foreground font-semibold px-10 h-14 text-base rounded-2xl shadow-amber hover:scale-105 transition-transform duration-200 border-0"
                >
                  Create your store now
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section >

      <Footer />
    </div >
  );
};

export default Index;
