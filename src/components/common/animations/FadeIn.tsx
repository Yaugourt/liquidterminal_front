"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Animation delay in seconds (defaults to 0). */
  delay?: number;
  /** Initial Y translation in px (defaults to 16). */
  yOffset?: number;
  /**
   * IntersectionObserver `rootMargin`. Negative values trigger the animation
   * *after* the element is partially scrolled into view. Defaults to "-80px".
   */
  rootMargin?: string;
}

/**
 * Scroll-triggered fade-in wrapper. Renders children invisible until they
 * intersect the viewport (with the configured rootMargin), then animates
 * opacity + Y translation over 0.5s.
 *
 * Lightweight — uses native IntersectionObserver, no framer-motion dependency.
 */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  yOffset = 16,
  rootMargin = "-80px",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${yOffset}px)`,
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
