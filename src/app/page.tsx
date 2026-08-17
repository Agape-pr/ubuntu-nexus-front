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
import craftImage from "@/assets/kigali-crafts.jpg";
import { Star, ArrowRight, Truck, Store } from "lucide-react";

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
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-12 lg:py-0">
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
                className="animate-fade-up flex flex-wrap items-center gap-3 sm:gap-4 mb-8"
                style={{ animationDelay: "300ms", opacity: 0 }}
              >
                <Button asChild size="lg" className="h-12 px-6 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:shadow-primary/20 transition-all">
                  <Link href="/auth?tab=register&role=seller" className="flex items-center gap-2">
                    Start Your Store <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 rounded-xl font-semibold text-sm border-border bg-card hover:bg-secondary">
                  <a href="#how-it-works">How It Works</a>
                </Button>
              </div>

              {/* Trust bar */}
              <div
                className="animate-fade-up flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground"
                style={{ animationDelay: "400ms", opacity: 0 }}
              >
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span>Escrow payment protection</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 font-semibold">
                  <span>Same-day Kigali delivery</span>
                </div>
              </div>
            </div>

            {/* Right: exact user hero mockup design with authentic user craft image */}
            <div
              className="animate-fade-up relative w-full hidden lg:block max-w-lg mx-auto py-8"
              style={{ animationDelay: "150ms", opacity: 0 }}
            >
              {/* Tilted outer background frame */}
              <div className="absolute inset-0 rounded-[36px] bg-secondary/50 border border-border/80 -rotate-3 scale-[1.03] transition-transform" />

              {/* Main Marketplace Card with authentic Rwandan crafts photo */}
              <div className="relative z-10 rounded-[30px] border border-border/90 overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src={craftImage}
                  alt="Authentic Rwandan Local Craft Market"
                  fill
                  priority
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                  <span className="text-sm font-extrabold tracking-wide drop-shadow-md">Kigali Local Marketplace</span>
                  <p className="text-[11px] text-white/80 line-clamp-1">Verified Rwandan stores & products</p>
                </div>
              </div>

              {/* Top Right Floating Pill: Fast Delivery (Moved DOWN by 2 margins to top-4) */}
              <div className="absolute top-4 -right-6 sm:-right-8 z-30 bg-card/95 backdrop-blur-xl border border-border/90 py-2.5 px-5 rounded-2xl shadow-2xl flex items-center gap-3.5 min-w-[240px] sm:min-w-[265px] animate-float-up">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground leading-tight">Fast Delivery</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Within 2 hours</p>
                </div>
              </div>

              {/* Bottom Left Floating Card: Seller (No Image — clean UI badge) */}
              <div className="absolute bottom-4 -left-6 sm:-left-8 z-30 w-36 sm:w-40 h-44 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/90 shadow-2xl p-4 flex flex-col justify-between overflow-hidden animate-float-slow">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Store size={20} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-extrabold text-foreground block">Seller</span>
                  <span className="text-[11px] text-muted-foreground block">Local Merchant</span>
                </div>
              </div>

              {/* Bottom Right Floating Badge: Review (Moved UP by 2 margins to bottom-4) */}
              <div className="absolute bottom-4 -right-6 sm:-right-8 z-30 bg-card/95 backdrop-blur-xl border border-border/90 py-2.5 px-5 rounded-2xl shadow-2xl min-w-[240px] sm:min-w-[275px] animate-float-down">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-foreground leading-tight">Kigali local vendors</p>
                    <p className="text-[11px] text-muted-foreground">Best platform ever!</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-current" />
                    ))}
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
