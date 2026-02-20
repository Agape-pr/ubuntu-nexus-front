import heroImage from "@/assets/kigali-convention.jpeg";
import kigaliSkyline from "@/assets/kigali-skyline.jpg";
import kigaliMarket from "@/assets/kigali-market.jpg";
import kigaliSeller from "@/assets/kigali-seller.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const SAMPLE_PRODUCTS = [
  { id: "1", name: "Ankara Print Tote Bag", price: 12500, storeName: "Nyirangarama Fashion", storeSlug: "nyirangarama-fashion", category: "Fashion", rating: 4.8, reviewCount: 24 },
  { id: "2", name: "Handwoven Agaseke Basket", price: 8000, storeName: "Kigali Crafts", storeSlug: "kigali-crafts", category: "Crafts", rating: 5, reviewCount: 18 },
  { id: "3", name: "Organic Kinigi Honey (500g)", price: 4500, storeName: "Hills & Harvest", storeSlug: "hills-harvest", category: "Food", rating: 4.6, reviewCount: 41 },
  { id: "4", name: "Rwandan Coffee Arabica Blend", price: 6800, storeName: "Great Lakes Coffee", storeSlug: "great-lakes-coffee", category: "Food", rating: 4.9, reviewCount: 87 },
];

const FEATURES = [
  {
    icon: Store,
    title: "Your store, your link",
    desc: "Create a beautiful store in minutes. Get a unique URL to share with anyone, anywhere.",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: ShieldCheck,
    title: "Secure every transaction",
    desc: "Buyer protection built in. Every order is tracked, verified, and dispute-ready.",
    color: "bg-emerald text-emerald-foreground",
  },
  {
    icon: Users,
    title: "Community-first commerce",
    desc: "More than a market — a network of trust. Buyers and sellers know each other.",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Zap,
    title: "MoMo payments coming",
    desc: "Pay and receive with Mobile Money. No bank account needed. Simple as sending a message.",
    color: "bg-primary text-primary-foreground",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    role: "Seller",
    title: "Create your store",
    desc: "Sign up as a seller, name your store, and get your unique store link in under 2 minutes.",
  },
  {
    step: "02",
    role: "Seller",
    title: "Add your products",
    desc: "Upload photos, set prices, and describe what you sell. Your store goes live instantly.",
  },
  {
    step: "03",
    role: "Buyer",
    title: "Discover & shop",
    desc: "Browse thousands of products from trusted sellers. Find what you need, pay securely.",
  },
];

const STATS = [
  { value: "2,400+", label: "Sellers registered" },
  { value: "18,000+", label: "Products listed" },
  { value: "Kigali", label: "Launching from" },
  { value: "100%", label: "Rwandan-built" },
];

const Index = () => {
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
              Commerce built on{" "}
              <span className="relative inline-block">
                <span className="text-accent drop-shadow-md">human</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/60 rounded-full" />
              </span>{" "}
              connection
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10 drop-shadow-sm backdrop-blur-[2px]">
              UbuntuNow is where Kigali's entrepreneurs meet their customers. Create your store, list your products, and grow your business — powered by community trust.
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
            <div className="flex items-center gap-2 mt-8">
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
                  <strong className="text-white">2,400+</strong> sellers already joined
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-accent py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-accent-foreground">{stat.value}</div>
                <div className="text-sm text-accent-foreground/70 mt-1">{stat.label}</div>
              </div>
            ))}
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
              Born from the City of a Thousand Hills
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              UbuntuNow grows from Kigali's spirit — vibrant entrepreneurs, lush hills, and a city moving fast into the future.
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
                <p className="text-lg font-bold">The city that never stops building</p>
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
              Built for real people
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We designed every feature with Kigali entrepreneurs and shoppers in mind — not some abstract global user.
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

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-secondary/40">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              From idea to income in minutes. Here's how UbuntuNow works for sellers and buyers.
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
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-background">
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
            {SAMPLE_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="py-24 gradient-hero relative overflow-hidden">
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
      </section>

      <Footer />
    </div>
  );
};

export default Index;
