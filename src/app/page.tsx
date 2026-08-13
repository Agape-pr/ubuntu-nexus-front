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
import { ShieldCheck, Sparkles, Zap, Star, ArrowRight } from "lucide-react";

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
              <div
                className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/80 text-xs font-medium text-muted-foreground mb-5"
                style={{ opacity: 0 }}
              >
                <Sparkles size={13} className="text-primary" />
                <span>Rwanda's Trusted Local Marketplace</span>
              </div>

              <h1
                className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-foreground leading-[1.1] mb-5 text-balance"
                style={{ animationDelay: "100ms", opacity: 0 }}
              >
                Buy and sell with{" "}
                <span className="relative inline-block text-primary">
                  local confidence
                </span>
              </h1>

              <p
                className="animate-fade-up text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
                style={{ animationDelay: "200ms", opacity: 0 }}
              >
                Connect directly with Rwandan artisans, farmers, and local merchants.
                Shop unique local products backed by our escrow protection and same-day Kigali delivery.
              </p>

              <div
                className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-8"
                style={{ animationDelay: "300ms", opacity: 0 }}
              >
                <Button asChild size="lg" className="w-full sm:w-auto font-semibold px-6 h-11 rounded-lg shadow-2xs">
                  <Link href="/auth?tab=register&role=seller">
                    Start Your Store <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-lg border-border bg-card hover:bg-secondary">
                  <a href="#how-it-works">How It Works</a>
                </Button>
              </div>

              {/* Trust bar */}
              <div
                className="animate-fade-up flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground"
                style={{ animationDelay: "400ms", opacity: 0 }}
              >
                <div className="flex items-center gap-1.5 text-foreground">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>Escrow payment protection</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  <span>Same-day Kigali delivery</span>
                </div>
              </div>
            </div>

            {/* Right: image presentation */}
            <div
              className="animate-fade-up relative h-[400px] lg:h-[480px] w-full hidden lg:block"
              style={{ animationDelay: "150ms", opacity: 0 }}
            >
              {/* Main image container */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border border-border bg-card">
                <Image
                  src={heroImage}
                  alt="Local marketplace in Kigali"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 0px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-foreground bg-card/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-border/80 shadow-2xs flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium">Connecting local businesses across Kigali</span>
                </div>
              </div>

              {/* Inset seller photo */}
              <div className="absolute -bottom-4 -left-4 h-36 w-32 rounded-xl overflow-hidden shadow-md border-2 border-card z-20 bg-card">
                <Image
                  src={kigaliSellerImage}
                  alt="A local vendor in Kigali"
                  fill
                  sizes="130px"
                  className="object-cover"
                />
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
