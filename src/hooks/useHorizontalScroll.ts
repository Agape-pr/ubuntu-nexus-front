"use client";

import { useRef } from "react";

/**
 * Powers a horizontally-scrollable card rail with prev/next buttons.
 * Attach `trackRef` to the scrolling container and `data-scroll-card` to
 * each card wrapper so the step size matches the actual card width.
 */
export function useHorizontalScroll() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const node = trackRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-scroll-card]");
    const step = (card?.offsetWidth ?? 170) + 12;
    node.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return { trackRef, scrollByCard };
}
