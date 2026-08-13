"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface PromoSlide {
  key: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
  className: string;
  iconClassName: string;
}

export function PromoBanner({
  slides,
  intervalMs = 6000,
}: {
  slides: PromoSlide[];
  intervalMs?: number;
}) {
  if (slides.length === 0) return null;

  // Extended slides with clones at both ends for infinite circular looping
  const extendedSlides = [
    slides[slides.length - 1],
    ...slides,
    slides[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1); // 1 corresponds to original slide 0
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active slide index (0 to slides.length - 1) for pagination indicators
  const activeDotIndex =
    (currentIndex - 1 + slides.length) % slides.length;

  const nextSlide = useCallback(() => {
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Handle infinite loop reset after transition finishes
  const handleTransitionEnd = () => {
    if (currentIndex === extendedSlides.length - 1) {
      // Reached trailing clone of slide 0 -> jump silently to real slide 0 (index 1)
      setWithTransition(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached leading clone of last slide -> jump silently to real last slide (index slides.length)
      setWithTransition(false);
      setCurrentIndex(slides.length);
    }
  };

  // Auto-play timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused || isDragging) return;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs, isPaused, isDragging, nextSlide]);

  // Pointer / Touch drag handling for natural swipe feeling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const deltaX = e.clientX - startXRef.current;
    setDragOffset(deltaX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);

    if (dragOffset < -40) {
      nextSlide();
    } else if (dragOffset > 40) {
      prevSlide();
    }
    setDragOffset(0);
    startXRef.current = null;
  };

  const Content = ({ slide }: { slide: PromoSlide }) => (
    <div
      className={`group/slide relative flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 transition-all duration-300 ${slide.className}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Floating Glass Icon Box */}
        <div
          className={`h-12 w-12 sm:h-13 sm:w-13 shrink-0 rounded-2xl bg-background/50 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-sm group-hover/slide:scale-105 transition-transform duration-300 ${slide.iconClassName}`}
        >
          <slide.icon size={24} />
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/80 border border-foreground/5">
              Featured
            </span>
          </div>
          <p className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate tracking-tight">
            {slide.title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate leading-relaxed">
            {slide.subtitle}
          </p>
        </div>
      </div>

      {/* Action CTA Button */}
      {slide.cta && (
        <div className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 border border-foreground/10 text-xs sm:text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-200 group-hover/slide:translate-x-0.5">
          <span>{slide.cta}</span>
          <ArrowRight size={15} className="transition-transform group-hover/slide:translate-x-1" />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="group relative overflow-hidden rounded-2xl select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        handlePointerUp();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      ref={containerRef}
    >
      {/* Auto-play Top Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute top-0 left-0 right-0 z-20 h-0.5 bg-foreground/10 overflow-hidden">
          <div
            key={currentIndex}
            className={`h-full bg-primary/80 transition-all ${
              isPaused || isDragging ? "pause" : ""
            }`}
            style={{
              animation: `slideProgress ${intervalMs}ms linear infinite`,
            }}
          />
        </div>
      )}

      {/* Carousel Track */}
      <div
        className={`flex ${
          withTransition && !isDragging
            ? "transition-transform duration-500 ease-out"
            : "transition-none"
        }`}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, i) => (
          <div key={`${slide.key}-${i}`} className="w-full shrink-0">
            {slide.href ? (
              <Link href={slide.href} className="block">
                <Content slide={slide} />
              </Link>
            ) : (
              <Content slide={slide} />
            )}
          </div>
        ))}
      </div>

      {/* Manual Desktop Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/70 border border-white/10 text-foreground backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-200 shadow-md"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/70 border border-white/10 text-foreground backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-200 shadow-md"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Interactive Pagination Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setWithTransition(true);
                setCurrentIndex(idx + 1);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeDotIndex === idx
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* CSS Keyframes for progress bar */}
      <style jsx>{`
        @keyframes slideProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
