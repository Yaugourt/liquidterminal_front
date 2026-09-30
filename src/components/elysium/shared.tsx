"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";

/** Public Elysium testnet explorer; its /tx, /address and /block routes resolve. */
export const EXPLORER = "https://test-explorer.elysium.kinetiq.xyz";
export const EMPTY = "–";

export const short = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : EMPTY);

export function ago(ms: number, now: number): string {
  if (!Number.isFinite(ms)) return EMPTY;
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

export function duration(s: number | null): string {
  if (s == null || !Number.isFinite(s)) return EMPTY;
  if (s < 90) return `${Math.round(s)}s`;
  if (s < 5400) return `${Math.round(s / 60)}m`;
  return `${(s / 3600).toFixed(1)}h`;
}

/** Re-renders every `ms` so relative ages keep counting. */
export function useNow(ms = 5_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function ExtLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`hover:text-brand ${className}`}>
      {children}
    </a>
  );
}

/** Internal Elysium address page. */
export const addressHref = (address: string) => `/elysium/address/${address.toLowerCase()}`;

/**
 * Address link: the label opens our Elysium address page, a small icon opens
 * the public explorer. `explorer={false}` hides the icon in dense rows.
 */
export function AddrLink({
  address,
  children,
  className = "",
  explorer = true,
}: {
  address: string;
  children?: ReactNode;
  className?: string;
  explorer?: boolean;
}) {
  if (!address) return <span className="text-text-tertiary">{EMPTY}</span>;
  return (
    <span className="inline-flex items-center gap-1 max-w-full">
      <Link href={addressHref(address)} className={`hover:text-brand truncate ${className}`}>
        {children ?? short(address)}
      </Link>
      {explorer && (
        <a
          href={`${EXPLORER}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in the Elysium explorer"
          title="Open in the Elysium explorer"
          className="text-text-tertiary hover:text-brand shrink-0"
        >
          <ExternalLink size={10} />
        </a>
      )}
    </span>
  );
}

/** Label for a selector: resolved name, else the raw selector. */
export function methodLabel(methodId: string | null | undefined, names?: Record<string, string> | null): string {
  if (!methodId) return "transfer";
  const sig = names?.[methodId];
  if (!sig) return methodId;
  const i = sig.indexOf("(");
  return i > 0 ? sig.slice(0, i) : sig;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="h-full min-h-[120px] grid place-items-center text-[12px] text-text-tertiary px-4 text-center">{children}</div>;
}


/** Daily rows minus the still-filling current day, oldest first (API sends newest first or oldest first; both handled). */
export function completeDays<T extends { day: string; partial?: boolean }>(rows: T[] | null | undefined): T[] {
  return [...(rows ?? [])].filter((r) => !r.partial).sort((a, b) => a.day.localeCompare(b.day));
}

/** UTC midnight of a YYYY-MM-DD day, in ms. */
export const dayMs = (day: string) => Date.parse(`${day}T00:00:00Z`);

export const pct = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? EMPTY : `${(v * 100).toFixed(digits)}%`;

/** Signed change between two counts, as text + tone. */
export function delta(now: number, prev: number): { text: string; up: boolean } | null {
  if (!prev) return now ? { text: "new", up: true } : null;
  const d = (now - prev) / prev;
  // From 10x up a percentage stops reading ("+12189%"): show the multiplier.
  if (now / prev >= 10) return { text: `${Math.round(now / prev)}x`, up: true };
  return { text: `${d >= 0 ? "+" : ""}${Math.round(d * 100)}%`, up: d >= 0 };
}

/** "Sep 27, 14:05" for an Elysium/UTC timestamp string. */
export function elysiumTimeLabel(time: string): string {
  const ms = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(time) ? time : `${time}Z`);
  if (!Number.isFinite(ms)) return time;
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}
