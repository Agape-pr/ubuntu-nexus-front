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
  const { isLoggedIn, mounted } = useAuthState();

  // Signed-in users (buyers and sellers alike) get the sidebar dashboard, not
  // the marketing landing page — "/" is the guest-facing storefront pitch.
  useEffect(() => {
    if (mounted && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [mounted, isLoggedIn, router]);

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
                className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-5"
                style={{ opacity: 0 }}
              >
                <Sparkles size={13} className="text-accent" />
                <span>The new era of local commerce</span>
              </div>

              <h1
                className="animate-fade-up text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-foreground leading-[1.08] mb-5 text-balance"
                style={{ animationDelay: "100ms", opacity: 0 }}
              >
                Buy and sell with{" "}
                <span className="relative inline-block text-primary">
                  people you trust
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-accent/40"
                    viewBox="0 0 200 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M2.00049 6.84039C50.0005 1.84039 120.501 -2.15961 198.001 6.84039"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p
                className="animate-fade-up text-base sm:text-lg text-muted-foreground leading-relaxed mb-7 max-w-xl"
                style={{ animationDelay: "200ms", opacity: 0 }}
              >
                Start selling online in minutes. Discover unique products from
                your neighbors, and shop securely with our 2-hour escrow
                guarantee.
              </p>

              <div
                className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-8"
                style={{ animationDelay: "300ms", opacity: 0 }}
              >
                <Button asChild size="lg" className="w-full sm:w-auto gradient-amber text-near-black font-semibold px-7 h-12 rounded-2xl shadow-amber hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-0">
                  <Link href="/auth?tab=register&role=seller">
                    Start your store <ArrowRight size={17} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 rounded-2xl border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all duration-300">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              {/* Trust bar */}
              <div
                className="animate-fade-up flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                style={{ animationDelay: "400ms", opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="font-medium text-foreground">100% Secure</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex -space-x-1.5">
                    {["🧑🏿", "👩🏾", "👨🏿"].map((emoji, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] z-10 shadow-sm"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <span className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    🌱 Early Access — Be a founding seller
                  </span>
                </div>
              </div>
            </div>

            {/* Right: image collage — hidden on mobile, visible ≥ lg */}
            <div
              className="animate-fade-up relative h-[420px] lg:h-[540px] w-full hidden lg:block"
              style={{ animationDelay: "150ms", opacity: 0 }}
            >
              {/* Background tilt card */}
              <div className="absolute inset-0 rounded-3xl bg-secondary transform rotate-3" />

              {/* Main image */}
              <div className="absolute top-4 left-4 right-12 bottom-12 rounded-3xl overflow-hidden shadow-xl border-4 border-card bg-secondary">
                <Image
                  src={heroImage}
                  alt="Buyers shopping at a local market in Kigali"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 0px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Live</span>
                  </div>
                </div>
              </div>

              {/* Floating: seller portrait */}
              <div className="absolute -bottom-6 -left-6 h-44 w-36 rounded-2xl overflow-hidden shadow-xl border-4 border-card z-20 bg-secondary">
                <Image
                  src={kigaliSellerImage}
                  alt="A local seller in Kigali"
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>

              {/* Floating: fast delivery badge */}
              <div className="animate-float absolute top-10 -right-6 bg-card/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-border/50 z-30 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Same-day in Kigali</p>
                </div>
              </div>

              {/* Floating: rating card */}
              <div
                className="animate-float absolute bottom-20 -right-2 bg-card p-3 rounded-2xl shadow-xl border border-border z-30"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-xs font-medium text-foreground">
                  <span className="font-bold">Kigali local vendors</span>
                  <br />
                  Best platform ever!
                </p>
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
