"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail, ArrowRight, Zap, Shield, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { Icon: Twitter,   href: "https://twitter.com/ubuntunow",          label: "Twitter"   },
  { Icon: Instagram, href: "https://instagram.com/ubuntunow",        label: "Instagram" },
  { Icon: Linkedin,  href: "https://linkedin.com/company/ubuntunow", label: "LinkedIn"  },
  { Icon: Mail,      href: "mailto:hello@ubuntunow.com",             label: "Email"     },
];

const NAV_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Marketplace",    href: "/marketplace"                    },
      { label: "Start selling",  href: "/auth?tab=register&role=seller"  },
      { label: "Buyer guide",    href: "/guide/buyer"                    },
      { label: "Seller guide",   href: "/guide/seller"                   },
      { label: "Pricing",        href: "/pricing"                        },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us",       href: "/about"    },
      { label: "Blog",           href: "/blog"     },
      { label: "Careers",        href: "/careers"  },
      { label: "Contact",        href: "/contact"  },
      { label: "Press kit",      href: "/press"    },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center",    href: "/help"        },
      { label: "Community",      href: "/community"   },
      { label: "Changelog",      href: "/changelog"   },
      { label: "API docs",       href: "/docs/api"    },
      { label: "Status page",    href: "/status"      },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy",  href: "/privacy-policy"   },
      { label: "Terms of service",href: "/terms-of-service"  },
      { label: "Refund policy",   href: "/refund-policy"     },
      { label: "Cookie policy",   href: "/cookie-policy"     },
    ],
  },
];

const TRUST_CARDS = [
  { Icon: Clock,       label: "2-hour escrow protection",  sub: "Safe & secured"       },
  { Icon: Shield,      label: "100% secure payments",      sub: "Powered by Pesapal"   },
  { Icon: Zap,         label: "Fast payouts",              sub: "Same-day transfers"   },
  { Icon: TrendingUp,  label: "Trusted local commerce",    sub: "10,000+ sellers"      },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Glowing social icon button */
function SocialButton({ Icon, href, label }: { Icon: React.ElementType; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="
        group relative h-9 w-9 rounded-xl
        bg-white/5 border border-white/10
        flex items-center justify-center
        text-white/40 hover:text-amber-400
        hover:border-amber-400/40
        hover:bg-amber-400/10
        transition-all duration-300
        hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]
      "
    >
      <Icon size={15} />
    </a>
  );
}

/** Animated nav link */
function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="
          group inline-flex items-center gap-1.5
          text-sm text-white/40
          hover:text-amber-400
          transition-colors duration-200
        "
      >
        <span className="relative">
          {label}
          {/* Slide-in underline */}
          <span className="
            absolute -bottom-0.5 left-0 h-px w-0
            bg-amber-400/70
            group-hover:w-full
            transition-all duration-300
          " />
        </span>
      </Link>
    </li>
  );
}

/** Trust/stats mini card */
function TrustCard({ Icon, label, sub }: { Icon: React.ElementType; label: string; sub: string }) {
  return (
    <div className="
      group flex items-center gap-3 px-4 py-3.5
      rounded-2xl border border-white/8
      bg-white/[0.03]
      hover:bg-white/[0.06]
      hover:border-amber-400/20
      hover:-translate-y-0.5
      transition-all duration-300
    ">
      {/* Icon bubble */}
      <div className="
        h-8 w-8 shrink-0 rounded-xl
        bg-amber-400/10 border border-amber-400/20
        flex items-center justify-center
        text-amber-400
        group-hover:shadow-[0_0_12px_rgba(251,191,36,0.2)]
        transition-all duration-300
      ">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs font-semibold text-white/80 leading-none">{label}</p>
        <p className="text-[11px] text-white/35 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Pre-CTA Section (sits above footer) ─────────────────────────────────────

export function FooterCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-20 md:py-28">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-400/6 blur-[96px]" />
        <div className="absolute right-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-600/5 blur-[72px]" />
      </div>

      <div className="container relative text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/8 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-400 tracking-wide">Join 10,000+ sellers across Rwanda</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Ready to start selling?
        </h2>
        <p className="text-lg text-white/40 max-w-lg mx-auto mb-10 leading-relaxed">
          Turn your skills and products into income. Community-powered commerce, built for Africa.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Primary CTA */}
          <Link
            href="/auth?tab=register&role=seller"
            className="
              group inline-flex items-center gap-2 px-7 py-3.5
              bg-amber-400 text-[#0a0a0a]
              font-semibold text-sm rounded-2xl
              hover:bg-amber-300
              hover:shadow-[0_0_32px_rgba(251,191,36,0.35)]
              transition-all duration-300
            "
          >
            Start for free
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
          {/* Secondary CTA */}
          <Link
            href="/marketplace"
            className="
              inline-flex items-center gap-2 px-7 py-3.5
              border border-white/12 text-white/70
              font-medium text-sm rounded-2xl
              hover:border-white/25 hover:text-white
              hover:bg-white/5
              transition-all duration-300
            "
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#080808]">

      {/* ── Top border glow ── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" aria-hidden />

      {/* ── Background ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-amber-400/4 blur-[80px]" />
        <div className="absolute right-0 top-40 h-56 w-56 rounded-full bg-amber-600/4 blur-[64px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-amber-400/3 blur-[60px]" />
      </div>

      <div className="container relative py-14 md:py-20">

        {/* ══ TOP GRID: Brand + Nav ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-white/8">

          {/* Brand column */}
          <div className="md:col-span-4">
            {/* Wordmark */}
            <div className="flex items-center gap-2 mb-5">
              {/* Mini icon mark */}
              <div className="h-8 w-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                <span className="text-amber-400 font-black text-sm">U</span>
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                Ubuntu<span className="text-amber-400">Now</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Human connection before transactions. Community-powered commerce from Kigali to the world.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5 mb-8">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <SocialButton key={label} Icon={Icon} href={href} label={label} />
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2.5">Stay in the loop</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email address for newsletter"
                  className="
                    flex-1 min-w-0 h-9 px-3 text-sm
                    bg-white/5 border border-white/10 rounded-xl
                    text-white placeholder:text-white/25
                    focus:outline-none focus:border-amber-400/50 focus:bg-white/8
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  aria-label="Subscribe to newsletter"
                  className="
                    h-9 px-4 rounded-xl text-sm font-semibold
                    bg-amber-400/15 text-amber-400
                    border border-amber-400/25
                    hover:bg-amber-400/25
                    transition-all duration-200
                  "
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 md:pl-6">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink key={link.label} {...link} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ══ TRUST INDICATORS ════════════════════════════════════════════ */}
        <div className="py-10 border-b border-white/8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-4 text-center">
            Why merchants choose UbuntuNow
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TRUST_CARDS.map((card) => (
              <TrustCard key={card.label} {...card} />
            ))}
          </div>
        </div>

        {/* ══ APP DOWNLOAD BUTTONS ════════════════════════════════════════ */}
        <div className="py-10 border-b border-white/8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/25 sm:mr-2 shrink-0">
            Get the app
          </p>
          {/* App Store mock */}
          <a
            href="#"
            aria-label="Download on the App Store"
            className="
              group inline-flex items-center gap-3 px-4 py-2.5
              rounded-2xl border border-white/10 bg-white/4
              hover:border-white/20 hover:bg-white/8
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            {/* Apple icon (inline SVG) */}
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-white transition-colors">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-white/35 leading-none">Download on the</p>
              <p className="text-sm font-semibold text-white/80 leading-tight group-hover:text-white transition-colors">App Store</p>
            </div>
          </a>
          {/* Google Play mock */}
          <a
            href="#"
            aria-label="Get it on Google Play"
            className="
              group inline-flex items-center gap-3 px-4 py-2.5
              rounded-2xl border border-white/10 bg-white/4
              hover:border-white/20 hover:bg-white/8
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            {/* Play icon (inline SVG) */}
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-white transition-colors">
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l15 8.5c.5.27.5 1 0 1.27L4.5 21c-.5.3-1.5.3-1.5-.5z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-white/35 leading-none">Get it on</p>
              <p className="text-sm font-semibold text-white/80 leading-tight group-hover:text-white transition-colors">Google Play</p>
            </div>
          </a>
        </div>

        {/* ══ BOTTOM BAR ══════════════════════════════════════════════════ */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-5">

          {/* Copyright + Kigali badge */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-white/25">
              © {new Date().getFullYear()} UbuntuNow Ltd. All rights reserved.
            </p>
            {/* Built in Kigali badge */}
            <span className="
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-white/5 border border-white/10
              text-[11px] text-white/40 font-medium
            ">
              🇷🇼 Built with pride in Kigali
            </span>
          </div>

          {/* Right side cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Pesapal badge */}
            <span className="
              inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-amber-400/8 border border-amber-400/18
              text-xs font-bold text-amber-400/80 tracking-wide
            ">
              💳 Powered by Pesapal
            </span>

            {/* Status indicator */}
            <span className="inline-flex items-center gap-1.5 text-xs text-white/30">
              <CheckCircle2 size={12} className="text-emerald-400/80" />
              All systems operational
            </span>

            {/* Ubuntu quote */}
            <p className="text-xs text-white/20 italic hidden xl:block">
              "I am because we are." — Ubuntu
            </p>
          </div>
        </div>

        {/* Ubuntu quote on smaller screens */}
        <p className="text-xs text-white/20 italic text-center mt-4 xl:hidden">
          "I am because we are." — Ubuntu
        </p>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;