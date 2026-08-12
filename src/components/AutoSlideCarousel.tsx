"use client";

import { useEffect, useRef, useState } from "react";

interface AutoSlideCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemKey: (item: T) => string | number;
  /** Milliseconds between auto-advances. */
  intervalMs?: number;
  /** Tailwind width classes applied to each slide wrapper. */
  itemWidthClass?: string;
}

/**
 * Small auto-advancing, swipeable card strip with dot indicators. Pauses while
 * the user is actively touching/dragging, resumes shortly after they let go.
 */
export function AutoSlideCarousel<T>({
  items,
  renderItem,
  itemKey,
  intervalMs = 3500,
  itemWidthClass = "w-[108px] sm:w-[128px]",
}: AutoSlideCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIndex = (i: number) => {
    const node = trackRef.current;
    const card = node?.children[i] as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => {
        const next = (i + 1) % items.length;
        scrollToIndex(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, intervalMs]);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };
  const scheduleResume = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, 3000);
  };

  const handleScroll = () => {
    const node = trackRef.current;
    const card = node?.children[0] as HTMLElement | undefined;
    if (!node || !card) return;
    const step = card.offsetWidth + 12;
    const i = Math.round(node.scrollLeft / step);
    setIndex(Math.min(Math.max(i, 0), items.length - 1));
  };

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={pause}
        onPointerUp={scheduleResume}
        onTouchStart={pause}
        onTouchEnd={scheduleResume}
        onScroll={handleScroll}
        className="flex overflow-x-auto no-scrollbar gap-3 pb-1 snap-x snap-mandatory scroll-smooth"
      >
        {items.map((item) => (
          <div key={itemKey(item)} className={`${itemWidthClass} shrink-0 snap-start`}>
            {renderItem(item)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((item, i) => (
            <button
              key={itemKey(item)}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => { pause(); setIndex(i); scrollToIndex(i); scheduleResume(); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
