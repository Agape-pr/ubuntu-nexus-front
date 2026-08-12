"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Compass, Home, Search, LifeBuoy } from "lucide-react";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Compass size={32} className="text-primary" />
            </div>
          </div>

          <p className="text-sm font-black tracking-[0.3em] text-muted-foreground mb-2">ERROR 404</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            This page took a wrong turn
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We couldn&apos;t find <span className="text-foreground font-mono text-sm break-all">{pathname}</span>.
            It may have been moved, or the link might be outdated.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button asChild size="lg" className="rounded-xl gap-2">
              <Link href="/"><Home size={16} /> Back to home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl gap-2">
              <Link href="/#how-it-works"><Search size={16} /> See how it works</Link>
            </Button>
          </div>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LifeBuoy size={14} /> Still stuck? Contact support
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
