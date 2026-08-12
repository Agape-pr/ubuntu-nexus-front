"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface PromoSlide {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
  className: string;
  iconClassName: string;
}

/**
 * Full-width auto-rotating promo banner (one slide at a time). Pauses while
 * the user is dragging/touching, resumes shortly after.
 */
export function PromoBanner({ slides, intervalMs = 6000 }: { slides: PromoSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs, paused]);

  if (slides.length === 0) return null;

  const Content = ({ slide }: { slide: PromoSlide }) => (
    <div className={`flex items-center gap-4 rounded-2xl border px-4 py-4 sm:px-5 ${slide.className}`}>
      <div className={`h-11 w-11 shrink-0 rounded-xl bg-background/40 flex items-center justify-center ${slide.iconClassName}`}>
        <slide.icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-foreground text-sm sm:text-base truncate">{slide.title}</p>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{slide.subtitle}</p>
      </div>
      {slide.cta && (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
          {slide.cta} <ArrowRight size={15} />
        </span>
      )}
    </div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.key} className="w-full shrink-0">
            {slide.href ? (
              <Link href={slide.href}>
                <Content slide={slide} />
              </Link>
            ) : (
              <Content slide={slide} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
