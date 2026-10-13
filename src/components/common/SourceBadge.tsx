"use client";

import { memo } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

/**
 * SourceBadge — tiny third-party data credit for a card-head / PageHeader
 * `actions` slot, with a health dot for the upstream route.
 *
 * Sits left of `DataStatus` in the `ml-auto` corner:
 *   <SourceBadge source="hyperfolio" status={sourceStatus(error, isLoading, isStale)} />
 *
 * Sources: `hyperfolio` (/hyperfolio/* proxy), `hypurrscan` (api.hypurrscan.io),
 * `defillama` (api.llama.fi + /defillama/* proxy), `hypedexer` (/indexer/* proxy).
 *
 *  - `ok`      → green dot, the route answered.
 *  - `error`   → red dot, last fetch failed (throttled, 5xx, unreachable…),
 *                including a failed refresh whose previous data stays on
 *                screen (`isStale` from `useDataFetching`).
 *  - `loading` → muted dot, no answer yet (first fetch in flight).
 *
 * Wire `status` from the hook that actually hits the upstream, never from a
 * derived "is there data" check — an empty wallet is still a healthy route.
 */

export type SourceBadgeStatus = "ok" | "error" | "loading";

export type SourceId = "hyperfolio" | "hypurrscan" | "defillama" | "hypedexer";

interface SourceMeta {
  label: string;
  href: string;
  /** Square logo under `public/`, rendered at 12px. */
  logo: string;
}

const SOURCES: Record<SourceId, SourceMeta> = {
  hyperfolio: { label: "Hyperfolio", href: "https://hyperfolio.xyz", logo: "/hyperfolio.png" },
  hypurrscan: { label: "Hypurrscan", href: "https://hypurrscan.io", logo: "/hypurrscan.jpg" },
  defillama: { label: "DefiLlama", href: "https://defillama.com", logo: "/defillama.jpg" },
  hypedexer: { label: "Hypedexer", href: "https://app.hypedexer.com", logo: "/hypedexer.png" },
};

/**
 * Derive the badge status from a `useDataFetching`-shaped hook: red on any
 * error or failed refresh (`isStale`), muted while the very first fetch is
 * still in flight, green otherwise.
 */
export function sourceStatus(error: unknown, isLoading?: boolean, isStale?: boolean): SourceBadgeStatus {
  if (error || isStale) return "error";
  if (isLoading) return "loading";
  return "ok";
}

/**
 * Same, for a card that hits several routes of one provider: red as soon as
 * any of them failed, muted only while none has answered yet.
 */
export function combinedSourceStatus(
  ...feeds: ReadonlyArray<{ error?: unknown; isLoading?: boolean; isStale?: boolean }>
): SourceBadgeStatus {
  if (feeds.some((f) => f.error || f.isStale)) return "error";
  if (feeds.length > 0 && feeds.every((f) => f.isLoading)) return "loading";
  return "ok";
}

const DOT: Record<SourceBadgeStatus, { className: string; title: string }> = {
  ok: { className: "bg-success", title: "route is up" },
  error: { className: "bg-danger", title: "route is failing" },
  loading: { className: "bg-text-tertiary/60", title: "waiting for the route" },
};

interface SourceBadgeProps {
  source: SourceId;
  status?: SourceBadgeStatus;
  className?: string;
}

const SourceBadgeComponent = ({ source, status = "ok", className = "" }: SourceBadgeProps) => {
  const meta = SOURCES[source];
  const dot = DOT[status];

  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Data by ${meta.label} — ${dot.title}`}
      className={`group inline-flex items-center gap-1.5 text-[10px] font-medium text-text-tertiary hover:text-text-secondary transition-colors select-none ${className}`}
    >
      {/* Static dot, like DataStatus: an endless ping on a failing route
          kept the page painting frames for as long as it stayed open. */}
      <span className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${dot.className}`} aria-hidden />
      <Image src={meta.logo} alt="" width={12} height={12} className="rounded-sm shrink-0" unoptimized />
      <span>{meta.label}</span>
      <ArrowUpRight size={10} className="opacity-0 -ml-0.5 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export const SourceBadge = memo(SourceBadgeComponent);
