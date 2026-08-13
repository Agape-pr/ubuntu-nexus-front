"use client";

import { Reveal } from "@/components/Reveal";
import { Heart, ShieldCheck, Zap, Clock, Shield, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Community Focused",
    desc: "Built to empower local Rwandan merchants and artisans to build sustainable digital storefronts.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Escrow",
    desc: "Payments are held safely until delivery is confirmed by the buyer, protecting both parties.",
  },
  {
    icon: Zap,
    title: "Fast Local Setup",
    desc: "Sellers can list products and share store links in minutes without technical complexity.",
  },
];

const trustPoints = [
  { icon: Clock,      title: "Escrow Protection",      sub: "Safe & verified payout" },
  { icon: Shield,     title: "Secure Payments",        sub: "Encrypted transactions" },
  { icon: Zap,        title: "Same-Day Delivery",      sub: "Across Kigali city" },
  { icon: TrendingUp, title: "Local Economic Growth", sub: "Empowering businesses" },
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 py-20 bg-background border-t border-border/60">
      <div className="container max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Our Mission</p>
          <h2 className="text-3xl font-bold text-foreground mb-3">About UbuntuNow</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Founded in Kigali to make local commerce simpler, safer, and accessible to everyone.
            We provide local businesses with modern tools to reach nearby customers with confidence.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((item, i) => (
            <Reveal key={item.title} delay={i * 100} className="bg-card border border-border/80 rounded-xl p-6 shadow-2xs hover:border-primary/40 transition-all">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 text-foreground">
                <item.icon size={20} />
              </div>
              <h3 className="font-semibold text-base text-foreground mb-1.5">{item.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6 text-center">
            Built for Rwandan Buyers and Sellers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((point, i) => (
              <Reveal
                key={point.title}
                delay={i * 80}
                className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground mb-1">
                  <point.icon size={18} />
                </div>
                <p className="font-semibold text-sm text-foreground">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.sub}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

