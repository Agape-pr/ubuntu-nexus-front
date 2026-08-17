"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { CreditCard, PackageCheck, ThumbsUp, Store, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: CreditCard,
    title: "Order & Secure Pay",
    description: "Browse local products and checkout. Funds stay in escrow until you inspect your delivery.",
  },
  {
    number: "2",
    icon: PackageCheck,
    title: "Direct Local Delivery",
    description: "The Kigali seller prepares your item and dispatches it straight to your address.",
  },
  {
    number: "3",
    icon: ThumbsUp,
    title: "Confirm & Release",
    description: "Verify your items upon arrival. Once satisfied, payment is released to the seller.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 min-h-screen flex flex-col justify-center py-16 md:py-20 bg-secondary/30 border-t border-border/60">
      <div className="container max-w-5xl mx-auto px-4">
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">How buying on UbuntuNow works</h2>
        </Reveal>

        {/* 3 Step Linear Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative mb-14">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100} className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shrink-0">
                  {step.number}
                </span>
                <step.icon size={18} className="text-primary shrink-0" />
                <h3 className="font-bold text-base text-foreground leading-tight">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">{step.description}</p>
            </Reveal>
          ))}
        </div>

        {/* Seller Banner */}
        <Reveal className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left max-w-md">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <Store size={14} /> For Local Merchants
            </span>
            <h3 className="text-xl font-bold text-foreground">Have a shop in Kigali?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create your digital storefront, upload items, and reach customers across Kigali with secure payouts.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 px-6 rounded-lg font-semibold gap-2 shrink-0">
            <Link href="/auth?tab=register&role=seller">
              <Store size={15} /> Open Your Store <ArrowRight size={15} />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}


