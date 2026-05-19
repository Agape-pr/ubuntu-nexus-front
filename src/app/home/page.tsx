"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Zap, Store, CreditCard, PackageCheck, ThumbsUp,
  ArrowRight, CheckCircle, Star, MapPin, Clock, Lock, Smile,
  ChevronRight, Users,
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
    border: "border-primary/20",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "Seller confirms & delivers",
    description:
      "The seller receives your order notification, confirms availability, and delivers the item — often the same day in Kigali.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "You approve — funds released",
    description:
      "Once you confirm you received exactly what you ordered, the escrow vault releases payment to the seller. Not happy? Get a full refund.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
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

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 -m-24 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -m-24 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
            <MapPin size={12} className="text-accent" />
            Built for Kigali&apos;s market culture
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Buy and sell the{" "}
            <span className="text-primary">Ubuntu way</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            UbuntuNow is a local marketplace designed around how Kigali actually works — confirm first, deliver same day, pay only when you&apos;re satisfied.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl font-semibold gap-2 shadow-sm">
                Browse products <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth?tab=register&intent=seller">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 rounded-2xl font-semibold gap-2">
                <Store size={16} /> Start your store free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works — Buyer flow ─────────────────────── */}
      <section className="py-20 bg-secondary/40">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">For buyers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Shop safely in 3 steps</h2>
          </div>

          <div className="relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-[3.5rem] left-[18%] right-[18%] h-px bg-border" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className={`relative h-28 w-28 rounded-full ${step.bg} border-8 border-background flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 mb-6`}>
                    <step.icon size={36} className={step.color} />
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-card border border-border font-bold text-xs text-foreground flex items-center justify-center shadow-sm">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Escrow explainer callout ─────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* ── How it works — Seller flow ─────────────────────── */}
      <section className="py-20 bg-secondary/40">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">For sellers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Launch your store today</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              No technical skills needed. No listing fees. Just you, your products, and thousands of local buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sellerSteps.map((step, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all group">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <step.icon size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-xs font-bold text-muted-foreground mb-1">Step {i + 1}</div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/auth?tab=register&intent=seller">
              <Button size="lg" className="h-12 px-8 rounded-2xl font-semibold gap-2">
                <Store size={16} /> Create my free store
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No credit card required · 2-minute setup</p>
          </div>
        </div>
      </section>

      {/* ── Guarantees grid ─────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our promises to you</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {guarantees.map((g, i) => (
              <div key={i} className="bg-secondary/50 border border-border rounded-2xl p-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <g.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial / social proof ───────────────────── */}
      <section className="py-16 bg-secondary/40">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-accent text-accent" />)}
          </div>
          <blockquote className="text-xl md:text-2xl font-semibold text-foreground leading-snug mb-5">
            &ldquo;I sold my first 10 items within a week of joining. The escrow system made buyers trust me immediately.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">AI</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Aline Ingabire</p>
              <p className="text-xs text-muted-foreground">Fashion seller · Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of Kigali sellers and buyers building a more connected local economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-2xl font-semibold gap-2">
                Browse marketplace <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-2xl font-semibold gap-2">
                <CheckCircle size={16} /> Sign up free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
