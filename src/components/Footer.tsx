import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const SOCIAL_LINKS = [
  { Icon: Twitter,   href: "https://twitter.com/ubuntunow",   label: "Twitter"   },
  { Icon: Instagram, href: "https://instagram.com/ubuntunow", label: "Instagram" },
  { Icon: Linkedin,  href: "https://linkedin.com/company/ubuntunow", label: "LinkedIn" },
  { Icon: Mail,      href: "mailto:hello@ubuntunow.com",      label: "Email"     },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="font-bold text-xl text-primary-foreground">
                Ubuntu<span className="text-accent">Now</span>
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              Human connection before transactions. Community-powered commerce from Kigali to the world.
            </p>
            <div className="flex gap-3 mt-6">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="h-8 w-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Marketplace", href: "/marketplace" },
                { label: "Start selling", href: "/auth?tab=register&role=seller" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About UbuntuNow", href: "/about" },
                { label: "Contact us", href: "/contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy policy", href: "/privacy-policy" },
                { label: "Terms of service", href: "/terms-of-service" },
                { label: "Refund policy", href: "/refund-policy" },
              ],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-sm text-primary-foreground mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © 2025 UbuntuNow Ltd. Built with pride in Kigali, Rwanda 🇷🇼
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-primary-foreground/40">
            <span className="px-2 py-1 rounded bg-primary-foreground/10 font-bold text-primary-foreground/80">💳 Powered by Pesapal</span>
            <span>"I am because we are." — Ubuntu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
