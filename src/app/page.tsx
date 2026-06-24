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
  Wallet,
  MapPin,
  ShoppingBag,
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

// Compact Imigongo line for the nav bottom accent
function ImigongoLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="imi-nav" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B87800" stopOpacity="0" />
          <stop offset="30%" stopColor="#B87800" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#F0B800" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#B87800" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B87800" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 6 L20 2 L40 6 L60 2 L80 6 L100 2 L120 6 L140 2 L160 6 L180 2 L200 6 L220 2 L240 6 L260 2 L280 6 L300 2 L320 6 L340 2 L360 6 L380 2 L400 6 L420 2 L440 6 L460 2 L480 6 L500 2 L520 6 L540 2 L560 6 L580 2 L600 6 L620 2 L640 6 L660 2 L680 6 L700 2 L720 6 L740 2 L760 6 L780 2 L800 6"
        stroke="url(#imi-nav)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0 6 L20 10 L40 6 L60 10 L80 6 L100 10 L120 6 L140 10 L160 6 L180 10 L200 6 L220 10 L240 6 L260 10 L280 6 L300 10 L320 6 L340 10 L360 6 L380 10 L400 6 L420 10 L440 6 L460 10 L480 6 L500 10 L520 6 L540 10 L560 6 L580 10 L600 6 L620 10 L640 6 L660 10 L680 6 L700 10 L720 6 L740 10 L760 6 L780 10 L800 6"
        stroke="url(#imi-nav)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const SURVEY_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSelEh_KeKRiNVo4YvtQbyVAMOgrkuxYQl3oB8edthADpUm-sg/viewform?usp=header";

const FEATURES = [
  {
    icon: Store,
    title: "Seller Storefronts",
    desc: "Launch your own branded shop in minutes — no tech skills, no fees to start.",
    accent: "#B87800",
  },
  {
    icon: ShieldCheck,
    title: "Escrow Protection",
    desc: "Payments held safe with a 2-hour dispute window after receiving delivery. Sellers get paid, buyers stay protected.",
    accent: "#16A34A",
  },
  {
    icon: Truck,
    title: "Built-In Logistics",
    desc: "From local deliveries to business fulfillment with live tracking — we handle the movement so you focus on selling.",
    accent: "#F0B800",
  },
  {
    icon: Zap,
    title: "Fast Fulfillment",
    desc: "Same-day and 2-hour delivery across Kigali. Your customers get what they want, when they want it.",
    accent: "#E05A00",
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setNavSolid(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const addRevealRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

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
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] overflow-x-hidden ambient-bg">

      {/* ── NAV with Imigongo accent ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navSolid
            ? "bg-black/95 backdrop-blur-xl"
            : "bg-black"
        }`}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <img
              src="/logo.png"
              alt="UbuntuNow"
              className="h-10 sm:h-14 w-auto object-contain"
            />
            <span className="text-[7px] min-[400px]:text-[8px] sm:text-[10px] font-bold text-[#B87800] uppercase tracking-[0.05em] sm:tracking-[0.15em] pl-3 sm:pl-6 border-l border-white/10 mt-1 leading-tight whitespace-nowrap">
              Built on Trust.<br />
              Powered by Community.
            </span>
          </div>
          <a
            href="#waitlist"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#B87800]/30 text-sm font-semibold text-[#FBF8F2] hover:bg-[#B87800]/10 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
        {/* Imigongo accent line below nav */}
        <ImigongoLine className="w-full h-[6px] opacity-50" />
      </nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-10 sm:pt-28 sm:pb-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center flex flex-col items-center">
          <div className="max-w-4xl flex flex-col items-center">
            <h1
              ref={addRevealRef}
              className="reveal reveal-delay-1 text-left w-full text-[24px] leading-[1.35] sm:text-4xl lg:text-5xl font-black sm:leading-[1.1] tracking-tight mb-5"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Commerce that operates 24/7.<br />
              Transactions protected from fraud.<br />
              Deliveries guaranteed on schedule.<br />
              <span className="text-[#B87800] inline-block mt-5 sm:mt-8">We&apos;re building the Tech-infrastructure for all three.</span>
            </h1>

            <p
              ref={addRevealRef}
              className="reveal reveal-delay-2 text-base text-[#888780] leading-relaxed mb-8 max-w-2xl mx-auto"
            >
              UbuntuNow is the <strong className="text-[#B87800]">Trust Layer</strong> for
              commerce in Rwanda — storefronts, escrow payments, and built-in logistics
              so sellers and buyers can trade with confidence, not worry.
            </p>

            {/* Waitlist form — refined */}
            <div
              ref={addRevealRef}
              className="reveal reveal-delay-3"
              id="waitlist"
            >
              {submitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-center gap-3 w-full max-w-md mx-auto text-emerald-400">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold text-sm">
                    You&apos;re on the list! We&apos;ll be in touch soon.
                  </span>
                </div>
              ) : (
                <div className="w-full max-w-[320px] sm:max-w-md mx-auto flex flex-col items-center">
                  {/* Refined Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-white/5 bg-white/[0.02] text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-[#B87800]/80">
                    <span className="w-1 h-1 rounded-full bg-[#B87800] animate-pulse"></span>
                    System in testing phase
                  </div>
                  <form
                    onSubmit={handleWaitlistSubmit}
                    className="flex flex-row items-stretch justify-center gap-2 w-full"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-w-0 bg-[#1A1A19] border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-[11px] sm:text-sm text-left text-white placeholder:text-white/25 outline-none focus:border-[#B87800]/40 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 bg-[#B87800] text-[#111110] px-4 sm:px-6 py-2.5 rounded-lg font-bold text-[11px] sm:text-sm hover:bg-[#F0B800] transition-colors whitespace-nowrap disabled:opacity-70"
                    >
                      {loading ? "Joining..." : "Join Waitlist"}
                      <ArrowRight size={14} strokeWidth={3} />
                    </button>
                  </form>
                  <p className="text-[11px] text-[#888780]/60 mt-2">
                    Be first to know when we launch. No spam.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-8 opacity-50" />
      </div>

      {/* ── FEATURES ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                ref={addRevealRef}
                className={`reveal reveal-delay-${i + 1} flex items-start gap-4 py-5 px-4 sm:px-4 hover:bg-white/[0.02] transition-colors duration-300 rounded-xl cursor-default ${
                  i < FEATURES.length - 2
                    ? "border-b border-white/5"
                    : i === FEATURES.length - 2
                    ? "border-b border-white/5 sm:border-b-0"
                    : ""
                } ${i % 2 === 0 ? "sm:border-r sm:border-white/5" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${i % 2 === 0 ? 'animate-float-slow' : 'animate-float-delayed'}`}
                  style={{ backgroundColor: `${feature.accent}12` }}
                >
                  <feature.icon size={18} style={{ color: feature.accent }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#FBF8F2] mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-[#888780] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div ref={addRevealRef} className="reveal text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-[#FBF8F2] mb-3 font-['Nunito'] tracking-tight">
              How It Works
            </h2>
            <p className="text-[#888780] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              A unified ecosystem designed for the Rwandan market. We connect the dots between selling, paying, and moving goods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#B87800]/30 to-transparent z-0"></div>
            
            {[
              {
                step: "01",
                icon: Store,
                title: "Launch Your Store",
                desc: "Sign up and list your products in minutes. No technical skills required, zero setup fees to start.",
              },
              {
                step: "02",
                icon: Wallet,
                title: "Secure Payments",
                desc: "Customers pay via MoMo or Card. Funds are securely locked in escrow until the item is delivered.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Automated Fulfillment",
                desc: "Our integrated logistics network automatically dispatches a rider to pick up and deliver directly to the buyer.",
              },
            ].map((item, i) => (
              <div key={item.step} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} relative z-10 flex flex-col items-center text-center`}>
                <div className="w-20 h-20 rounded-2xl bg-[#151514] border border-white/5 flex items-center justify-center mb-6 relative group hover:border-[#B87800]/40 hover:bg-[#1A1A19] transition-all duration-300">
                  <div className="absolute -top-3 -left-2 text-[11px] font-black text-[#B87800]/60 tracking-wider bg-[#111110] px-1">{item.step}</div>
                  <item.icon size={28} className="text-[#B87800] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FBF8F2] mb-2">{item.title}</h3>
                <p className="text-[14px] text-[#888780] leading-relaxed max-w-[280px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-8 opacity-40" />
      </div>

      {/* ── WHY BUYERS LOVE IT ── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div ref={addRevealRef} className="reveal text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-[#FBF8F2] mb-3 font-['Nunito'] tracking-tight">
              Do you usually order anything online?
            </h2>
            <p className="text-[#888780] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Online shopping in Rwanda has always carried a risk. We are eliminating that risk entirely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div ref={addRevealRef} className="reveal reveal-delay-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 hover:bg-white/[0.04] transition-colors duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#B87800]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="text-[#B87800]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#FBF8F2] mb-3">100% Fraud Protection</h3>
              <p className="text-[14px] text-[#888780] leading-relaxed">
                Your money is held securely by our escrow system. The seller does not get paid until the item is in your hands and you have confirmed it matches the description.
              </p>
            </div>
            <div ref={addRevealRef} className="reveal reveal-delay-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 hover:bg-white/[0.04] transition-colors duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#B87800]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="text-[#B87800]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#FBF8F2] mb-3">Live Delivery Tracking</h3>
              <p className="text-[14px] text-[#888780] leading-relaxed">
                No more wondering when your package will arrive or calling the delivery rider five times. Watch your delivery move on the map in real-time, exactly when you expect it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-8 opacity-40" />
      </div>

      {/* ── SELLER CTA — refined ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            className="reveal flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 py-6 sm:py-0"
          >
            <div className="max-w-md">
              <h2
                className="text-lg sm:text-xl font-black tracking-tight mb-1"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Sell in Rwanda? We want to hear from you.
              </h2>
              <p className="text-sm text-[#888780] leading-relaxed">
                Whether you sell online, in a shop, or need delivery for your business —
                your insights will shape how UbuntuNow works. Takes 3 minutes.
              </p>
            </div>
            <a
              href={SURVEY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B87800] text-[#111110] hover:bg-[#F0B800] transition-colors font-bold text-sm shrink-0"
            >
              Take the Survey
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-5 bg-black mt-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {/* Imigongo accent above footer */}
          <ImigongoLine className="w-full h-[6px] opacity-30 mb-5" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <img
              src="/logo.png"
              alt="UbuntuNow"
              className="h-10 w-auto object-contain"
            />
            <p className="text-[11px] text-[#888780] text-center sm:text-right mt-2 sm:mt-0 leading-relaxed">
              © 2026 UbuntuNow · Kigali, Rwanda<br />
              Built on Trust. Powered by Community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
