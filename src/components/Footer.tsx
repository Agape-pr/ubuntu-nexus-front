"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail, CheckCircle2, CreditCard, MapPin } from "lucide-react";

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
      { label: "Marketplace",    href: "/"                                },
      { label: "Start selling",  href: "/auth?tab=register&role=seller"  },
      { label: "Buyer guide",    href: "/guide/buyer"                    },
      { label: "Seller guide",   href: "/guide/seller"                   },
      { label: "Pricing",        href: "/pricing"                        },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us",       href: "/#about"   },
      { label: "Blog",           href: "/blog"     },
      { label: "Careers",        href: "/careers"  },
      { label: "Contact",        href: "/#contact" },
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SocialButton({ Icon, href, label }: { Icon: React.ElementType; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="
        h-9 w-9 rounded-lg
        bg-white/5 border border-white/10
        flex items-center justify-center
        text-white/50 hover:text-white
        hover:border-white/25
        hover:bg-white/10
        transition-all duration-200
      "
    >
      <Icon size={15} />
    </a>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="
          text-sm text-white/50
          hover:text-white
          transition-colors duration-200
        "
      >
        {label}
      </Link>
    </li>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-near-black text-cream border-t border-border/20">

      <div className="container relative py-12 md:py-16">

        {/* ══ TOP GRID: Brand + Nav ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-sm">U</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Ubuntu<span className="text-primary">Now</span>
              </span>
            </div>

            <p className="text-xs text-white/60 leading-relaxed max-w-xs mb-6">
              Connecting local artisans, shops, and buyers across Rwanda through trusted escrow commerce.
            </p>

            <div className="flex gap-2.5 mb-6">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <SocialButton key={label} Icon={Icon} href={href} label={label} />
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3.5">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <FooterLink key={link.label} {...link} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* ══ BOTTOM BAR ════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} UbuntuNow Ltd. All rights reserved.</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-white/40" />
              Kigali, Rwanda
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-white/60 font-medium">
              <CreditCard size={13} /> Secure Payment via Pesapal
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={13} /> Escrow Active
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export { Footer };
export default Footer;