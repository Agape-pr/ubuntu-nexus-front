"use client";

import { Reveal } from "@/components/Reveal";
import { Lock, Package, Store, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 py-20 bg-background border-t border-border/60">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Story */}
          <Reveal className="lg:col-span-7 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Built for Kigali&apos;s independent shops and buyers.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              UbuntuNow connects local Kigali sellers directly with buyers in their city. We take out the friction of online local commerce with verified escrow payments, instant seller setups, and reliable Kigali delivery.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/auth?tab=register&role=seller"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Become a seller <ArrowUpRight size={14} />
              </Link>
            </div>
          </Reveal>

          {/* Clean Highlights List */}
          <Reveal delay={100} className="lg:col-span-5 space-y-3">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border/70">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Escrow Payment Protection</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Funds held safely until buyer confirms receipt</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border/70">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Package size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Same-Day Local Delivery</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Fast dispatches right across Kigali city</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border/70">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Verified Local Storefronts</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Direct connection to real local business owners</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}


