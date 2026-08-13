"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Store, Zap, ShieldCheck, CreditCard, PackageCheck, ThumbsUp,
  Lock, Clock, Smile, Users, ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Order & Pay",
    description: "Browse items and checkout securely. Funds are placed into escrow until you receive your order.",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "Seller Delivers",
    description: "The seller confirms availability and handles delivery directly to your specified Kigali address.",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "Confirm Receipt",
    description: "Inspect your items. Once confirmed, payment is released to the seller.",
  },
];

const sellerSteps = [
  {
    icon: Store,
    title: "Set up your storefront",
    description: "Register a seller account, set your store name, and add your business location.",
  },
  {
    icon: Zap,
    title: "List your inventory",
    description: "Upload product photos, set prices, and specify stock availability.",
  },
  {
    icon: ShieldCheck,
    title: "Fulfill & get paid",
    description: "Receive order notifications, fulfill deliveries, and receive payouts via verified escrow.",
  },
];

const guarantees = [
  { icon: Lock, title: "Escrow Security", desc: "Payments protected until delivery is verified." },
  { icon: Clock, title: "Same-Day Kigali Delivery", desc: "Local vendors deliver fast across Kigali." },
  { icon: Smile, title: "Transparent Pricing", desc: "Clear item prices with zero hidden charges." },
  { icon: Users, title: "Direct Local Commerce", desc: "Support local Rwandan entrepreneurs." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-20 bg-secondary/30 border-t border-border/60">
      <div className="container max-w-5xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Shopping Experience</p>
          <h2 className="text-3xl font-bold text-foreground">How UbuntuNow Works</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 100} className="bg-card border border-border/80 rounded-xl p-6 shadow-2xs relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                  <step.icon size={20} />
                </div>
                <span className="text-xs font-bold text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                  {step.number}
                </span>
              </div>
              <h3 className="font-semibold text-base text-foreground mb-1.5">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
            </Reveal>
          ))}
        </div>

        {/* Escrow Explanation Card */}
        <Reveal className="mb-16">
          <div className="bg-card border border-border/80 rounded-xl p-6 md:p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Lock size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">Protected Payments via Escrow</h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  Escrow holds your payment securely until your order is delivered.
                  This ensures buyers receive what they paid for while giving sellers confidence that funds are secured.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* For Sellers */}
        <Reveal className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Merchant Platform</p>
          <h2 className="text-3xl font-bold text-foreground">Start Selling on UbuntuNow</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">
            Create your digital storefront and connect with local buyers across Rwanda.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {sellerSteps.map((step, i) => (
            <Reveal key={i} delay={i * 100} className="bg-card border border-border/80 rounded-xl p-6 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3 text-foreground">
                <step.icon size={20} />
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {i + 1}</div>
              <h3 className="font-semibold text-base text-foreground mb-1.5">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mb-16">
          <Button asChild size="lg" className="h-11 px-6 rounded-lg font-semibold gap-2">
            <Link href="/auth?tab=register&role=seller">
              <Store size={15} /> Create Seller Account <ArrowRight size={15} />
            </Link>
          </Button>
        </Reveal>

        {/* Platform Guarantees */}
        <Reveal className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Built on Trust and Reliability</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((g, i) => (
            <Reveal key={i} delay={i * 80} className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center mb-3 text-foreground">
                <g.icon size={18} />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">{g.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

