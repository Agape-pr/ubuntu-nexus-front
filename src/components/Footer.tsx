import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-sm">
                UN
              </div>
              <span className="font-bold text-xl text-primary-foreground">
                Ubuntu<span className="text-accent">Now</span>
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              Human connection before transactions. Community-powered commerce from Kigali to the world.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Instagram, Linkedin, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="h-9 w-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-200"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: ["Marketplace", "Sell on UbuntuNow", "How it works", "Pricing"],
            },
            {
              title: "Company",
              links: ["About us", "Blog", "Careers", "Press"],
            },
            {
              title: "Support",
              links: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-sm text-primary-foreground mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © 2025 UbuntuNow Ltd. Built with pride in Kigali, Rwanda 🇷🇼
          </p>
          <p className="text-xs text-primary-foreground/40">
            "I am because we are." — Ubuntu
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
