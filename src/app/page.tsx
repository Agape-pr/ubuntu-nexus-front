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
  Lock,
  Mail,
} from "lucide-react";

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
      {/* Rwandan Imigongo-inspired geometric pattern — diamonds and zigzags */}
      <defs>
        <linearGradient id="imi-grad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B87800" stopOpacity="0" />
          <stop offset="20%" stopColor="#B87800" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#F0B800" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#B87800" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B87800" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Central zigzag line */}
      <path
        d="M0 40 L40 20 L80 40 L120 20 L160 40 L200 20 L240 40 L280 20 L320 40 L360 20 L400 40 L440 20 L480 40 L520 20 L560 40 L600 20 L640 40 L680 20 L720 40 L760 20 L800 40"
        stroke="url(#imi-grad)"
        strokeWidth="2"
        fill="none"
      />
      {/* Mirror zigzag */}
      <path
        d="M0 40 L40 60 L80 40 L120 60 L160 40 L200 60 L240 40 L280 60 L320 40 L360 60 L400 40 L440 60 L480 40 L520 60 L560 40 L600 60 L640 40 L680 60 L720 40 L760 60 L800 40"
        stroke="url(#imi-grad)"
        strokeWidth="2"
        fill="none"
      />
      {/* Diamond accents at intersections */}
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

// ─── Hero SVG Illustration ──────────────────────────────────────────────────────

function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#F0B800" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#111110" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gold-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B87800" />
          <stop offset="100%" stopColor="#F0B800" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <rect width="480" height="560" fill="url(#glow)" />

      {/* Large geometric shapes — Imigongo inspired */}
      {/* Central diamond */}
      <path d="M240 120 L360 280 L240 440 L120 280 Z" stroke="#B87800" strokeWidth="1.5" fill="none" opacity="0.2" />
      <path d="M240 160 L330 280 L240 400 L150 280 Z" stroke="#F0B800" strokeWidth="1" fill="none" opacity="0.15" />

      {/* Radiating lines from center */}
      {[0, 30, 60, 90, 120, 150].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 240 + Math.cos(rad) * 220;
        const y2 = 280 + Math.sin(rad) * 220;
        return (
          <line
            key={angle}
            x1="240" y1="280"
            x2={x2} y2={y2}
            stroke="#B87800"
            strokeWidth="0.5"
            opacity="0.1"
          />
        );
      })}

      {/* Concentric circles */}
      {[60, 120, 180].map((r) => (
        <circle key={r} cx="240" cy="280" r={r} stroke="#B87800" strokeWidth="0.5" fill="none" opacity="0.08" />
      ))}

      {/* Abstract people — stylized figures */}
      {/* Figure 1 — seller */}
      <g transform="translate(160, 230)" opacity="0.9">
        <circle cx="0" cy="0" r="12" fill="#B87800" />
        <path d="M0 12 L0 45" stroke="#B87800" strokeWidth="3" strokeLinecap="round" />
        <path d="M-15 28 L0 20 L15 28" stroke="#B87800" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M-8 45 L0 45 L8 45" stroke="#B87800" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Figure 2 — buyer */}
      <g transform="translate(320, 230)" opacity="0.9">
        <circle cx="0" cy="0" r="12" fill="#F0B800" />
        <path d="M0 12 L0 45" stroke="#F0B800" strokeWidth="3" strokeLinecap="round" />
        <path d="M-15 28 L0 20 L15 28" stroke="#F0B800" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M-8 45 L0 45 L8 45" stroke="#F0B800" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Connection arc between figures */}
      <path
        d="M175 240 Q240 190 305 240"
        stroke="url(#gold-line)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      {/* Trust shield in center */}
      <g transform="translate(226, 195)">
        <path
          d="M14 2 L26 8 L26 18 C26 26 20 32 14 35 C8 32 2 26 2 18 L2 8 Z"
          fill="#B87800"
          fillOpacity="0.3"
          stroke="#F0B800"
          strokeWidth="1.5"
        />
        <path d="M10 18 L13 21 L19 15" stroke="#F0B800" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Small diamond accents */}
      {[
        [100, 180], [380, 180], [100, 380], [380, 380],
        [60, 280], [420, 280], [240, 100], [240, 460],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 6} L${x + 6} ${y} L${x} ${y + 6} L${x - 6} ${y} Z`}
          fill="#B87800"
          fillOpacity={0.15 + (i % 3) * 0.08}
        />
      ))}

      {/* Dot grid overlay in corners */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle
            key={`tl-${row}-${col}`}
            cx={40 + col * 16}
            cy={40 + row * 16}
            r="1.5"
            fill="#B87800"
            opacity="0.15"
          />
        ))
      )}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle
            key={`br-${row}-${col}`}
            cx={376 + col * 16}
            cy={456 + row * 16}
            r="1.5"
            fill="#B87800"
            opacity="0.15"
          />
        ))
      )}
    </svg>
  );
}

// ─── Floating Preview Card ──────────────────────────────────────────────────────

function FloatingCard({
  children,
  className = "",
  delay = "0s",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute bg-[#1C1A16]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress + nav background
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
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
    // Simulate API call — replace with real endpoint when ready
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#111110] text-[#FBF8F2] noise-overlay dot-grid overflow-x-hidden">
      {/* ── Scroll progress bar ── */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — NAV
      ══════════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navSolid
            ? "bg-[#111110]/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="UbuntuNow"
            className="h-10 w-auto object-contain"
          />

          {/* CTA */}
          <a
            href="#waitlist"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 text-sm font-bold text-[#FBF8F2] hover:bg-white/5 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — HERO (Split Layout)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 md:pt-0 md:pb-0">
        {/* Ambient glow — intentionally subtle, not the main visual */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#7A4F00]/8 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* ── Left: Copy ── */}
            <div className="max-w-xl">
              {/* Eyebrow */}
              <div
                ref={addRevealRef}
                className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs font-medium text-[#888780] mb-6"
              >
                <span className="text-sm">🌍</span>
                <span>Made for Rwanda. Built for Africa.</span>
              </div>

              {/* Headline */}
              <h1
                ref={addRevealRef}
                className="reveal reveal-delay-1 text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-6"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                The{" "}
                <span className="text-gradient-gold">trust layer</span>{" "}
                African commerce has been waiting for.
              </h1>

              {/* Sub-copy */}
              <p
                ref={addRevealRef}
                className="reveal reveal-delay-2 text-base sm:text-lg text-[#888780] leading-relaxed mb-8 max-w-md"
              >
                Not just another marketplace. We&apos;re building the tech
                infrastructure that empowers sellers and guarantees trust for
                every transaction.
              </p>

              {/* Waitlist form */}
              <div
                ref={addRevealRef}
                className="reveal reveal-delay-3 mb-5"
                id="waitlist"
              >
                {submitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 max-w-md text-emerald-400">
                    <CheckCircle2 size={22} />
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
                      placeholder="Enter your email for early access"
                      className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-white/25 h-10"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-[#B87800] text-[#111110] px-6 py-3 rounded-full font-black text-sm hover:bg-[#F0B800] transition-all duration-200 whitespace-nowrap w-full sm:w-auto disabled:opacity-70 glow-gold-sm hover:glow-gold"
                    >
                      {loading ? "Joining..." : "Join Waitlist"}{" "}
                      <ArrowRight size={15} strokeWidth={3} />
                    </button>
                  </form>
                )}
              </div>

              {/* Trust micro-copy */}
              <div
                ref={addRevealRef}
                className="reveal reveal-delay-4 flex flex-wrap items-center gap-4 text-xs text-[#888780]"
              >
                <span className="flex items-center gap-1.5">
                  <Lock size={11} className="text-[#B87800]" />
                  Your data stays private
                </span>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                <span className="flex items-center gap-1.5">
                  <Mail size={11} className="text-[#B87800]" />
                  No spam, ever
                </span>
              </div>
            </div>

            {/* ── Right: Illustration + Floating Cards ── */}
            <div className="relative hidden lg:flex items-center justify-center h-[540px]">
              {/* Main SVG illustration */}
              <HeroIllustration className="w-full h-full opacity-60" />

              {/* Floating card: Product preview */}
              <FloatingCard
                className="animate-float-slow p-3 top-12 right-4 w-48"
                delay="0s"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B87800]/30 to-[#F0B800]/10 flex items-center justify-center text-lg">
                    👜
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#FBF8F2]">
                      Leather Tote Bag
                    </p>
                    <p className="text-xs text-[#B87800] font-black">
                      RWF 24,000
                    </p>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating card: Escrow shield */}
              <FloatingCard
                className="animate-float-delayed p-3 bottom-24 left-0 w-52"
                delay="1.5s"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#FBF8F2]">
                      Payment Protected
                    </p>
                    <p className="text-[10px] text-[#888780]">
                      Escrow until delivery
                    </p>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating card: Seller verified */}
              <FloatingCard
                className="animate-float p-2.5 top-1/3 -left-4 w-44"
                delay="3s"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#B87800]/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-[#F0B800]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#FBF8F2]">
                      Verified Seller
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-[8px] text-[#F0B800]">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-12 opacity-60" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — WHAT WE'RE BUILDING
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div ref={addRevealRef} className="reveal text-center mb-14">
            <p className="text-xs font-bold text-[#B87800] uppercase tracking-[0.2em] mb-3">
              What we&apos;re building
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Commerce infrastructure,{" "}
              <span className="text-[#888780]">reimagined.</span>
            </h2>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                ref={addRevealRef}
                className={`reveal reveal-delay-${i + 1} group relative bg-[#1A1A19] border border-white/8 rounded-2xl p-6 sm:p-7 card-glow`}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${feature.accent}15` }}
                >
                  <feature.icon size={20} style={{ color: feature.accent }} />
                </div>

                {/* Text */}
                <h3 className="text-base font-bold text-[#FBF8F2] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#888780] leading-relaxed">
                  {feature.desc}
                </p>

                {/* Accent line at bottom */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.accent}60, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Imigongo Divider ── */}
      <div className="max-w-4xl mx-auto px-8">
        <ImigongoPattern className="w-full h-12 opacity-40" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — SELLER CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            className="reveal relative bg-gradient-to-br from-[#1C1A16] to-[#151412] border border-[#B87800]/20 rounded-3xl p-8 sm:p-12 overflow-hidden"
          >
            {/* Background geometric accent */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0 L200 100 L100 200 L0 100 Z" stroke="#F0B800" strokeWidth="1" />
                <path d="M100 30 L170 100 L100 170 L30 100 Z" stroke="#F0B800" strokeWidth="1" />
                <path d="M100 60 L140 100 L100 140 L60 100 Z" stroke="#F0B800" strokeWidth="1" />
              </svg>
            </div>

            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B87800]/10 border border-[#B87800]/20 text-xs font-bold text-[#B87800] mb-5">
                <Sparkles size={12} />
                Help shape the platform
              </div>

              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight mb-3"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Are you a seller in Rwanda?
              </h2>

              <p className="text-sm sm:text-base text-[#888780] leading-relaxed mb-7">
                Help us build a platform that makes selling easier, faster, and
                more profitable for you. Your insights shape everything. Takes
                only 3 minutes.
              </p>

              <a
                href={SURVEY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[#FBF8F2] hover:bg-white/10 transition-all duration-200 font-bold text-sm group"
              >
                <Sparkles
                  size={15}
                  className="text-[#B87800] group-hover:rotate-12 transition-transform"
                />
                Share your insights via Survey
                <ExternalLink size={13} className="text-white/30 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="UbuntuNow"
              className="h-8 w-auto object-contain"
            />

            {/* Status */}
            <div className="flex items-center gap-2 text-[#888780] text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems in final testing
            </div>

            {/* Info */}
            <p className="text-xs text-[#888780]">
              © 2025 UbuntuNow · Kigali, Rwanda 🇷🇼
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
