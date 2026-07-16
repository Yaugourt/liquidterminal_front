"use client";

import { TokenAvatar } from "./TokenAvatar";

/**
 * HypeMark — the canonical inline HYPE token mark: official logo (HL CDN via
 * `TokenAvatar`) optionally followed by the "HYPE" wordmark.
 *
 * Use it anywhere the UI chrome names the HYPE token (pills, KPI labels, card
 * titles, unit suffixes) instead of a bare "HYPE" string, so the token is
 * visually branded consistently across the app.
 *
 *   <HypeMark />                      → logo + "HYPE"
 *   <HypeMark logoOnly />             → just the logo (label already nearby)
 *   <HypeMark size="xs" className="…" />
 *
 * Inherits the surrounding text color/size for the wordmark by default —
 * pass `className` to override (it lands on the wrapper).
 */
interface HypeMarkProps {
  /** Logo square size, mapped to TokenAvatar sizes. Default `"xs"` (16px). */
  size?: "xs" | "sm" | "md" | "lg";
  /** Render only the logo, no "HYPE" text. */
  logoOnly?: boolean;
  /** Extra classes on the wrapper span (spacing, text size/color overrides). */
  className?: string;
}

export function HypeMark({ size = "xs", logoOnly = false, className = "" }: HypeMarkProps) {
  return (
    <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
      <TokenAvatar assetName="HYPE" size={size} className="rounded-full" />
      {!logoOnly && <span>HYPE</span>}
    </span>
  );
}
