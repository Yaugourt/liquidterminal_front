"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { ELYSIUM_ECO_URL, type EcoProjectStatus } from "@/services/elysium";
import { EMPTY } from "./shared";

export const TH = "text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold py-2 whitespace-nowrap";

/** Logos come from two outside hosts; `unoptimized` skips the image proxy (no remote allowlist needed). */
export function EcoLogo({ src, label, size = 22 }: { src: string | null; label: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-surface-2 text-[10px] font-semibold text-text-secondary"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-md bg-surface-2 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

const STATUS_TONE: Record<EcoProjectStatus, string> = {
  powers: "bg-brand/10 text-brand",
  live: "bg-success/10 text-success",
  testnet: "bg-success/10 text-success",
  verifying: "bg-gold/10 text-gold",
  announced: "bg-surface-2 text-text-secondary",
  exploring: "bg-surface-2 text-text-tertiary",
};

export function StatusTag({ status, label }: { status: EcoProjectStatus; label: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded px-1.5 py-px text-[10px] font-semibold ${STATUS_TONE[status]}`}>
      {label || EMPTY}
    </span>
  );
}

/** Prices of test tokens go down to 1e-9: three significant digits keep them readable. */
export function tinyUsd(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return EMPTY;
  if (v === 0) return "$0";
  if (v >= 1) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${v.toLocaleString("en-US", { maximumSignificantDigits: 3 })}`;
}

export function signedPct(v: number | null): { text: string; tone: string } {
  if (v == null || !Number.isFinite(v)) return { text: EMPTY, tone: "text-text-tertiary" };
  const digits = Math.abs(v) >= 100 ? 0 : 1;
  const text = `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
  return { text, tone: v > 0 ? "text-success" : v < 0 ? "text-danger" : "text-text-tertiary" };
}

/** Credit line: the directory and the token market are theirs, read with permission. */
export function EcoSource({ what }: { what: string }) {
  return (
    <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
      <Info size={12} className="mt-px shrink-0" />
      <span>
        {what} from{" "}
        <a href={ELYSIUM_ECO_URL} target="_blank" rel="noopener" className="text-text-secondary hover:text-brand">
          Elysium Ecosystem
        </a>{" "}
        (
        <a href="https://x.com/ElysiumEco" target="_blank" rel="noopener" className="text-text-secondary hover:text-brand">
          @ElysiumEco
        </a>
        ), an independent community index that reads the chain and the projects&apos; contracts. Refreshed every 5 minutes. Testnet values, not
        real money.
      </span>
    </p>
  );
}
