"use client";

import { useEffect, useState, type ReactNode } from "react";

interface HeroFadeInProps {
  children: ReactNode;
  className?: string;
  /** Animation delay in seconds (defaults to 0). */
  delay?: number;
  /** Initial Y translation in px (defaults to 20). */
  yOffset?: number;
  /** HTML element to render as (defaults to "div"). */
  as?: "div" | "p" | "h1" | "h2" | "h3";
}

/**
 * Initial-load fade-in (not scroll-triggered). Animates on mount after the
 * configured delay. Used for hero sections where the element is already
 * in view when the page loads.
 *
 * Lightweight — uses setTimeout, no framer-motion dependency.
 */
export function HeroFadeIn({
  children,
  className = "",
  delay = 0,
  yOffset = 20,
  as: Tag = "div",
}: HeroFadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Tag
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${yOffset}px)`,
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </Tag>
  );
}
