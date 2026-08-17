"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
 * Small auto-advancing, swipeable card strip with panel dot indicators.
 * Pauses while the user is actively touching/dragging, resumes shortly after.
 */
export function AutoSlideCarousel<T>({
  items,
  renderItem,
  itemKey,
  intervalMs = 3500,
  itemWidthClass = "w-[108px] sm:w-[128px]",
}: AutoSlideCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateItemsPerPage = useCallback(() => {
    const node = trackRef.current;
    if (!node) return;
    const firstCard = node.children[0] as HTMLElement | undefined;
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth;
    const gap = 12; // gap-3 = 12px
    const containerWidth = node.clientWidth;
    const count = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
    setItemsPerPage(count);
  }, []);

  useEffect(() => {
    updateItemsPerPage();
    const node = trackRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => updateItemsPerPage());
    ro.observe(node);
    return () => ro.disconnect();
  }, [updateItemsPerPage, items.length]);

  const numPanels = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const scrollToIndex = (i: number) => {
    const node = trackRef.current;
    const card = node?.children[i] as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (numPanels <= 1) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setPanelIndex((p) => {
        const nextPanel = (p + 1) % numPanels;
        const targetIndex = Math.min(nextPanel * itemsPerPage, items.length - 1);
        scrollToIndex(targetIndex);
        return nextPanel;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [numPanels, itemsPerPage, items.length, intervalMs]);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const scheduleResume = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 3000);
  };

  const handleScroll = () => {
    const node = trackRef.current;
    const card = node?.children[0] as HTMLElement | undefined;
    if (!node || !card) return;
    const step = card.offsetWidth + 12;
    const currentCardIndex = Math.round(node.scrollLeft / step);
    const currentPanel = Math.min(
      Math.max(Math.floor(currentCardIndex / itemsPerPage), 0),
      numPanels - 1
    );
    setPanelIndex(currentPanel);
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

      {numPanels > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: numPanels }).map((_, p) => (
            <button
              key={p}
              type="button"
              aria-label={`Go to panel ${p + 1}`}
              aria-current={p === panelIndex}
              onClick={() => {
                pause();
                setPanelIndex(p);
                const targetIndex = Math.min(p * itemsPerPage, items.length - 1);
                scrollToIndex(targetIndex);
                scheduleResume();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                p === panelIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
