"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { ProductCarousel } from "@/components/ProductCarousel";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuthState";
import heroImage from "@/assets/hero-kigali.jpg";
import kigaliSellerImage from "@/assets/kigali-seller.jpg";
import { Star, ArrowRight } from "lucide-react";

// ─── HomeContent ──────────────────────────────────────────────────────────────

const HomeContent = () => {
  const router = useRouter();
  const { isLoggedIn, userRole, mounted } = useAuthState();

  // Signed-in users (buyers and sellers alike) get the sidebar dashboard, not
  // the marketing landing page — "/" is the guest-facing storefront pitch.
  // Buyers land straight on the Shop tab; sellers land on their Overview.
  useEffect(() => {
    if (mounted && isLoggedIn) {
      router.replace(userRole === "seller" ? "/dashboard" : "/dashboard?view=shop");
    }
  }, [mounted, isLoggedIn, userRole, router]);

  if (!mounted || isLoggedIn) return <HomeSkeleton />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ══ LANDING HERO — first thing a visitor sees at "/" ══ */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="absolute top-0 right-0 -m-20 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative z-10 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* Left: copy */}
            <div className="max-w-2xl">
              <h1
                className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-foreground leading-[1.1] mb-5 text-balance"
                style={{ animationDelay: "100ms", opacity: 0 }}
              >
                Buy and sell with{" "}
                <span className="relative inline-block text-primary">
                  people you trust
                </span>
              </h1>

              <p
                className="animate-fade-up text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
                style={{ animationDelay: "200ms", opacity: 0 }}
              >
                Start selling online in minutes. Discover unique products from your neighbors, and shop securely with our 2-hour escrow guarantee.
              </p>

              <div
                className="animate-fade-up grid grid-cols-2 sm:flex sm:flex-row gap-2.5 sm:gap-3 mb-8"
                style={{ animationDelay: "300ms", opacity: 0 }}
              >
                <Button asChild size="lg" className="w-full sm:w-auto font-semibold px-3 sm:px-6 h-11 text-xs sm:text-sm rounded-lg shadow-2xs">
                  <Link href="/auth?tab=register&role=seller">
                    Start Your Store <ArrowRight size={14} className="ml-1 sm:ml-2 shrink-0 hidden xs:inline-block" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-11 px-3 sm:px-6 text-xs sm:text-sm rounded-lg border-border bg-card hover:bg-secondary">
                  <a href="#how-it-works">How It Works</a>
                </Button>
              </div>

              {/* Trust bar */}
              <div
                className="animate-fade-up flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground"
                style={{ animationDelay: "400ms", opacity: 0 }}
              >
                <div className="flex items-center gap-1.5 text-foreground">
                  <span>Escrow payment protection</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <span>Same-day Kigali delivery</span>
                </div>
              </div>
            </div>

            {/* Right: clean storefront hero preview */}
            <div
              className="animate-fade-up relative w-full hidden lg:block"
              style={{ animationDelay: "150ms", opacity: 0 }}
            >
              <div className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-md overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      UN
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Kigali Stores</h3>
                      <p className="text-xs text-muted-foreground">Local verified sellers</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Fast Local Delivery</p>
                      <p className="text-[11px] text-muted-foreground">Orders dispatched directly across Kigali</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Escrow Guarantee</p>
                      <p className="text-[11px] text-muted-foreground">2-hour escrow security on all purchases</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel />

      {/* ══ MARKETING SECTIONS — part of the landing page, reachable for everyone ══ */}
      <AboutSection />
      <HowItWorksSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

// ─── Page export ──────────────────────────────────────────────────────────────

function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="h-14 border-b border-border/60" />
      <div className="container px-4 pt-10 pb-10">
        <div className="h-6 w-40 bg-secondary rounded-full animate-pulse mb-4" />
        <div className="h-10 w-3/4 bg-secondary rounded-lg animate-pulse mb-3" />
        <div className="h-4 w-1/2 bg-secondary rounded animate-pulse mb-6" />
        <div className="h-14 w-full max-w-lg bg-secondary rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

const Home = () => (
  <Suspense fallback={<HomeSkeleton />}>
    <HomeContent />
  </Suspense>
);

export default Home;
