"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Store,
  Truck,
  Home,
  ShoppingBag,
  User,
  Search,
  Globe,
  MapPin,
  Wallet,
} from "lucide-react";

// ─── Imigongo SVG Pattern ───────────────────────────────────────────────────────

function ImigongoPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="imi-grad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B87800" stopOpacity="0" />
          <stop offset="20%" stopColor="#B87800" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#F0B800" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#B87800" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B87800" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 L40 20 L80 40 L120 20 L160 40 L200 20 L240 40 L280 20 L320 40 L360 20 L400 40 L440 20 L480 40 L520 20 L560 40 L600 20 L640 40 L680 20 L720 40 L760 20 L800 40"
        stroke="url(#imi-grad)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0 40 L40 60 L80 40 L120 60 L160 40 L200 60 L240 40 L280 60 L320 40 L360 60 L400 40 L440 60 L480 40 L520 60 L560 40 L600 60 L640 40 L680 60 L720 40 L760 60 L800 40"
        stroke="url(#imi-grad)"
        strokeWidth="2"
        fill="none"
      />
      {[80, 240, 400, 560, 720].map((x) => (
        <path
          key={x}
          d={`M${x} 28 L${x + 12} 40 L${x} 52 L${x - 12} 40 Z`}
          fill="#B87800"
          fillOpacity="0.3"
        />
      ))}
    </svg>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const SELLERS = [
  {
    id: 1,
    name: "Premium Electronics",
    location: "Kigali, Rwanda",
    verified: true,
    featured: true,
    gradient: "from-blue-600 to-blue-800",
    icon: "📱",
  },
  {
    id: 2,
    name: "Fashion & Apparel",
    location: "Kigali, Rwanda",
    verified: true,
    featured: true,
    gradient: "from-purple-600 to-pink-600",
    icon: "👗",
  },
  {
    id: 3,
    name: "Home & Living",
    location: "Kigali, Rwanda",
    verified: true,
    featured: true,
    gradient: "from-green-600 to-emerald-600",
    icon: "🏠",
  },
  {
    id: 4,
    name: "Beauty & Care",
    location: "Kigali, Rwanda",
    verified: true,
    featured: false,
    gradient: "from-rose-600 to-red-600",
    icon: "💄",
  },
];

const FEATURES = [
  {
    icon: Store,
    title: "Shop from Trusted Stores",
    desc: "Verified and trusted businesses with guaranteed quality",
  },
  {
    icon: ShieldCheck,
    title: "100% Protected",
    desc: "Escrow payments protect both buyers and sellers",
  },
  {
    icon: Zap,
    title: "2-Hour Delivery",
    desc: "Fast fulfillment across Kigali with live tracking",
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] overflow-x-hidden flex flex-col">
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#111110]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Top bar: Logo + Language */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-black">
                <span className="text-[#FBF8F2]">Ubuntu</span>
                <span className="text-[#111110] bg-gradient-to-br from-[#B87800] to-[#F0B800] px-2 py-0.5 rounded ml-1 italic">
                  Now
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm">
                <Globe size={16} />
                <span>RW</span>
              </button>
              <div className="text-sm font-semibold">🇷🇼 RWF</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888780]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#1A1A19] border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#B87800]/40 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <main className="flex-1">
        {/* ── HERO BANNER ── */}
        <section className="bg-gradient-to-br from-[#1C1A16] to-[#151412] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Copy */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Shop from <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0B800] via-[#B87800] to-[#F0B800]">trusted stores</span>. Delivered to your door.
                </h1>
                <p className="text-lg text-[#888780] mb-8 leading-relaxed max-w-md">
                  Discover unique products from verified local sellers with guaranteed escrow protection and fast delivery across Kigali.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#B87800] to-[#F0B800] text-[#111110] px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all hover:-translate-y-0.5">
                    <ShoppingBag size={20} />
                    Shop Now
                  </button>
                  <button className="flex items-center justify-center gap-2 border-2 border-[#B87800]/40 text-[#FBF8F2] px-8 py-4 rounded-lg font-bold hover:border-[#B87800]/70 hover:bg-[#B87800]/10 transition-all">
                    <Store size={20} />
                    Create a Store
                  </button>
                </div>

                {/* Secondary CTA */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <a href="#" className="inline-flex items-center gap-2 text-[#F0B800] hover:text-[#F0B800]/80 transition-colors font-semibold">
                    <span>Become a Field Agent</span>
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>

              {/* Right: Visual element */}
              <div className="hidden lg:block">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#B87800]/20 to-[#F0B800]/10 border border-[#B87800]/20 flex items-center justify-center text-6xl">
                  📦
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED SELLERS ── */}
        <section className="py-16 sm:py-24 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👑</span>
                  <span className="text-sm font-bold text-[#B87800] uppercase tracking-widest">Premium</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Featured Sellers
                </h2>
                <p className="text-[#888780] mt-2">Shop from verified and trusted businesses</p>
              </div>
              <a href="#" className="text-[#B87800] hover:text-[#F0B800] font-semibold flex items-center gap-1 transition-colors">
                View all <ArrowRight size={18} />
              </a>
            </div>

            {/* Sellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SELLERS.map((seller) => (
                <div
                  key={seller.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1A16] to-[#151412] border border-white/5 hover:border-[#B87800]/40 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${seller.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  {/* Content */}
                  <div className="relative p-6 flex flex-col h-full">
                    <div className="mb-auto">
                      <div className="text-5xl mb-4">{seller.icon}</div>
                      <h3 className="font-bold text-lg text-[#FBF8F2] mb-2">{seller.name}</h3>
                      <p className="text-sm text-[#888780] flex items-center gap-1">
                        <MapPin size={14} />
                        {seller.location}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/10">
                      {seller.verified && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mb-4">
                          <CheckCircle2 size={14} />
                          Verified Seller
                        </div>
                      )}
                      <button className="w-full bg-[#B87800] text-[#111110] py-2.5 rounded-lg font-bold text-sm hover:bg-[#F0B800] transition-colors">
                        Visit Shop →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY UBUNTU NOW ── */}
        <section className="py-16 sm:py-24 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Why Ubuntu Now?
              </h2>
              <p className="text-[#888780] text-lg">The trust layer for African commerce</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="group bg-gradient-to-br from-[#1C1A16] to-[#151412] border border-white/5 rounded-2xl p-8 hover:border-[#B87800]/40 transition-all hover:shadow-xl"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#B87800]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="text-[#B87800]" size={28} />
                  </div>
                  <h3 className="font-bold text-xl text-[#FBF8F2] mb-3">{feature.title}</h3>
                  <p className="text-[#888780] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EARLY ACCESS ── */}
        <section className="py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-[#1C1A16] to-[#151412] border border-[#B87800]/20 rounded-2xl p-8 sm:p-12">
              <h2 className="text-3xl font-black mb-4 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Be First to Launch
              </h2>
              <p className="text-center text-[#888780] mb-8 max-w-md mx-auto">
                Join our waitlist to get early access and shape the future of commerce in Rwanda.
              </p>

              {submitted ? (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 size={24} strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold">You&apos;re on the list!</p>
                    <p className="text-sm text-emerald-200/70">We&apos;ll be in touch soon.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-[#1A1A19] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#B87800]/40 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#B87800] text-[#111110] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#F0B800] transition-colors whitespace-nowrap disabled:opacity-70"
                  >
                    {loading ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ══ BOTTOM NAVIGATION ══════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111110]/95 backdrop-blur-xl border-t border-white/5 sm:hidden">
        <div className="flex items-center justify-around h-20">
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-[#B87800]">
            <Home size={24} />
            <span className="text-[10px] font-semibold">Home</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-[#888780] hover:text-[#FBF8F2] transition-colors">
            <ShoppingBag size={24} />
            <span className="text-[10px] font-semibold">Products</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-[#888780] hover:text-[#FBF8F2] transition-colors">
            <Store size={24} />
            <span className="text-[10px] font-semibold">Shops</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-[#888780] hover:text-[#FBF8F2] transition-colors relative">
            <Wallet size={24} />
            <span className="text-[10px] font-semibold">Cart</span>
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">1</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-[#888780] hover:text-[#FBF8F2] transition-colors">
            <User size={24} />
            <span className="text-[10px] font-semibold">Profile</span>
          </a>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
