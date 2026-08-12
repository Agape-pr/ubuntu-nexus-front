"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Store, Zap, ShieldCheck, CreditCard, PackageCheck, ThumbsUp,
  Star, Lock, Clock, Smile, Users, ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Buyer places an order",
    description:
      "You browse, choose a product you love, and pay securely through UbuntuNow. Your money goes into an escrow vault — not directly to the seller.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "Seller confirms & delivers",
    description:
      "The seller receives your order notification, confirms availability, and delivers the item — often the same day in Kigali.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "You approve — funds released",
    description:
      "Once you confirm you received exactly what you ordered, the escrow vault releases payment to the seller. Not happy? Get a full refund.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const sellerSteps = [
  {
    icon: Store,
    title: "Create your free store",
    description: "Sign up as a seller, set your store name, add a logo, and write a short description. Takes 2 minutes.",
  },
  {
    icon: Zap,
    title: "List your products",
    description: "Add photos, set a price, choose a category, and specify whether you have stock ready or source on order.",
  },
  {
    icon: ShieldCheck,
    title: "Sell with confidence",
    description: "Receive orders, confirm and deliver, then get paid — all protected by UbuntuNow's escrow system.",
  },
];

const guarantees = [
  { icon: Lock, title: "Escrow Protection", desc: "Money held safely until you confirm delivery. No risk of losing funds." },
  { icon: Clock, title: "Same-day Delivery", desc: "Most Kigali sellers confirm and deliver within hours — not days." },
  { icon: Smile, title: "No Hidden Fees", desc: "What you see on the product card is exactly what you pay. Period." },
  { icon: Users, title: "Local Community", desc: "Every seller is a real person in Rwanda. You're supporting local businesses." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-20 bg-secondary/40">
      <div className="container max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">For buyers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Shop safely in 3 steps</h2>
        </Reveal>

        <div className="relative mb-20">
          <div className="hidden md:block absolute top-[3.5rem] left-[18%] right-[18%] h-px bg-border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 120} className="flex flex-col items-center text-center group">
                <div className={`relative h-28 w-28 rounded-full ${step.bg} border-8 border-background flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 mb-6`}>
                  <step.icon size={36} className={step.color} />
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-card border border-border font-bold text-xs text-foreground flex items-center justify-center shadow-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mb-20">
          <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Lock size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">What is escrow and why does it matter?</h3>
                <p className="text-white/75 leading-relaxed">
                  Escrow means your payment is held by UbuntuNow — not sent to the seller immediately. It&apos;s only released once you confirm you received your item in good condition. This protects you as a buyer and builds trust between strangers buying and selling locally.
                </p>
              </div>
              <ChevronRight size={20} className="text-white/50 shrink-0 hidden md:block" />
            </div>
          </div>
        </Reveal>

        <Reveal className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">For sellers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Launch your store today</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            No technical skills needed. No listing fees. Just you, your products, and thousands of local buyers.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {sellerSteps.map((step, i) => (
            <Reveal key={i} delay={i * 120} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <step.icon size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-1">Step {i + 1}</div>
              <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mb-20">
          <Button asChild size="lg" className="h-12 px-8 rounded-2xl font-semibold gap-2 hover:-translate-y-0.5 transition-transform">
            <Link href="/auth?tab=register&role=seller"><Store size={16} /> Create my free store</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">No credit card required · 2-minute setup</p>
        </Reveal>

        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our promises to you</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {guarantees.map((g, i) => (
            <Reveal key={i} delay={i * 90} className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:border-primary/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <g.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={18} className="fill-accent text-accent" />)}
          </div>
          <blockquote className="text-xl md:text-2xl font-semibold text-foreground leading-snug mb-5 max-w-2xl mx-auto">
            &ldquo;I sold my first 10 items within a week of joining. The escrow system made buyers trust me immediately.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">AI</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Aline Ingabire</p>
              <p className="text-xs text-muted-foreground">Fashion seller · Kigali, Rwanda</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
