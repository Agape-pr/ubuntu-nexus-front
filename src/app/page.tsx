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

const SURVEY_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSelEh_KeKRiNVo4YvtQbyVAMOgrkuxYQl3oB8edthADpUm-sg/viewform?usp=header";

const FEATURES = [
  {
    icon: Store,
    title: "Seller Storefronts",
    desc: "Your own branded shop, live in minutes. No tech skills needed.",
    accent: "#B87800",
  },
  {
    icon: ShieldCheck,
    title: "Escrow Protection",
    desc: "Every payment held safe until you confirm delivery. Zero risk.",
    accent: "#16A34A",
  },
  {
    icon: Zap,
    title: "2-Hour Delivery",
    desc: "Local sellers, lightning-fast fulfillment across Kigali.",
    accent: "#F0B800",
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Nav background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavSolid(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for reveal animations
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
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navSolid
            ? "bg-[#111110]/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <img
            src="/logo.png"
            alt="UbuntuNow"
            className="h-14 w-auto object-contain"
          />
          <a
            href="#waitlist"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-sm font-semibold text-[#FBF8F2] hover:bg-white/5 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <h1
              ref={addRevealRef}
              className="reveal text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              The <span className="text-[#B87800]">trust layer</span> African
              commerce has been waiting for.
            </h1>

            <p
              ref={addRevealRef}
              className="reveal reveal-delay-1 text-base text-[#888780] leading-relaxed mb-6 max-w-lg"
            >
              We&apos;re building the tech infrastructure that empowers sellers
              and guarantees trust for every transaction in Rwanda.
            </p>

            {/* Waitlist form */}
            <div
              ref={addRevealRef}
              className="reveal reveal-delay-2"
              id="waitlist"
            >
              {submitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3 max-w-md text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="font-bold text-sm">
                    You&apos;re on the list! We&apos;ll be in touch soon.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="bg-[#1A1A19] border border-white/10 p-1.5 pl-5 rounded-full flex flex-col sm:flex-row items-center justify-between max-w-md gap-2"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-white/25 h-10"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#B87800] text-[#111110] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#F0B800] transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-70"
                  >
                    {loading ? "Joining..." : "Join Waitlist"}{" "}
                    <ArrowRight size={14} strokeWidth={3} />
                  </button>
                </form>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                ref={addRevealRef}
                className={`reveal reveal-delay-${i + 1} bg-[#1A1A19] border border-white/8 rounded-xl p-5`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${feature.accent}15` }}
                >
                  <feature.icon size={18} style={{ color: feature.accent }} />
                </div>
                <h3 className="text-sm font-bold text-[#FBF8F2] mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#888780] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-8 opacity-40" />
      </div>

      {/* ── SELLER CTA ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            className="reveal bg-[#1A1A19] border border-white/8 rounded-xl p-6 sm:p-8"
          >
            <h2
              className="text-xl sm:text-2xl font-black tracking-tight mb-2"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Are you a seller in Rwanda?
            </h2>
            <p className="text-sm text-[#888780] leading-relaxed mb-5 max-w-md">
              Help us build a platform that works for you. Your insights shape
              everything. Takes 3 minutes.
            </p>
            <a
              href={SURVEY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#FBF8F2] hover:bg-white/10 transition-colors font-semibold text-sm"
            >
              <Sparkles size={14} className="text-[#B87800]" />
              Take the Survey
              <ExternalLink size={12} className="text-white/30" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <img
            src="/logo.png"
            alt="UbuntuNow"
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs text-[#888780]">
            © 2025 UbuntuNow · Kigali, Rwanda
          </p>
        </div>
      </footer>
    </div>
  );
}
