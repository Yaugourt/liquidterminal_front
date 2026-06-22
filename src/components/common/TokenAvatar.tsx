"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getTokenIconUrl,
  getTokenInitials,
  type TokenKind,
} from "@/lib/tokenIconUrl";

/**
 * TokenAvatar — square rounded-md token icon resolved against the Hyperliquid
 * CDN, with a 2-letter initials fallback on load error.
 *
 * Single primitive for any inline "small coin badge" anywhere in the app
 * (tables, feeds, modal headers). For the dashboard leaderboard cell pattern
 * (`avatar + name + sub`), use `<ModuleAsset assetName="…">` instead — it
 * wraps this avatar with the label block.
 *
 * Always prefer this over hand-rolled `<Image>` constructions: it centralises
 * the HL CDN naming conventions and the fallback look.
 */

const SIZE_PX: Record<NonNullable<TokenAvatarProps["size"]>, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
};

const SIZE_CLASS: Record<NonNullable<TokenAvatarProps["size"]>, string> = {
  xs: "w-4 h-4 text-[7px]",
  sm: "w-[18px] h-[18px] text-[8px]",
  md: "w-5 h-5 text-[9px]",
  lg: "w-6 h-6 text-[9px]",
};

interface TokenAvatarProps {
  /** Asset name — used for the alt text + initials fallback, and (when `src` is
   * absent) resolved against the HL CDN (`BTC`, `HYPE_spot`, `xyz:BRENTOIL`). */
  assetName: string;
  /**
   * Explicit image URL (e.g. a backend-provided `logo`). When set, it is used
   * directly and the CDN convention is bypassed. Falls back to the CDN URL
   * (then to initials) when null/empty.
   */
  src?: string | null;
  /** Override the URL convention — only useful for bare tickers. Default `"auto"`. */
  kind?: TokenKind;
  /** Pixel size of the square. Default `"md"` (20×20). */
  size?: "xs" | "sm" | "md" | "lg";
  /** Extra classes applied to the wrapper (e.g. `opacity-50` for delisted). */
  className?: string;
  /**
   * Optional fallback string when the asset name itself isn't a good initials
   * source (e.g. backend returns a `name` like "HYPE/USDC" but we want "HY").
   */
  fallback?: string;
}

export function TokenAvatar({
  assetName,
  src,
  kind = "auto",
  size = "md",
  className = "",
  fallback,
}: TokenAvatarProps) {
  const [errored, setErrored] = useState(false);
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASS[size];
  const resolvedSrc = src && src.trim() ? src : getTokenIconUrl(assetName, kind);

  return (
    <span
      className={`${sizeClass} shrink-0 rounded-md flex items-center justify-center font-semibold bg-brand/10 text-brand overflow-hidden ${className}`}
    >
      {errored || !resolvedSrc ? (
        getTokenInitials(fallback ?? assetName)
      ) : (
        <Image
          src={resolvedSrc}
          alt={assetName}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
          unoptimized
        />
      )}
    </span>
  );
}
