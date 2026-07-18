"use client";

import Link from "next/link";
import { useAuctionTiming } from "@/services/market/auction/hooks/useAuctionTiming";
import { usePerpAuctionTiming } from "@/services/market/auction/hooks/usePerpAuctionTiming";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface AuctionStripProps {
  kind: "spot" | "perp";
  /** One-line variant for lane footers (PerpDexs). */
  compact?: boolean;
}

const META: Record<AuctionStripProps["kind"], { label: string; href: string }> = {
  spot: { label: "Spot ticker · HIP-1", href: "/market/spot/auction" },
  perp: { label: "Perp deploy · HIP-3", href: "/market/perp/auction" },
};

function SpotStripData({ compact }: { compact?: boolean }) {
  const { auctionState, isLoading } = useAuctionTiming();
  return <StripBody kind="spot" state={auctionState} isLoading={isLoading} compact={compact} />;
}

function PerpStripData({ compact }: { compact?: boolean }) {
  const { auctionState, isLoading } = usePerpAuctionTiming();
  return <StripBody kind="perp" state={auctionState} isLoading={isLoading} compact={compact} />;
}

interface StripBodyProps {
  kind: "spot" | "perp";
  state: {
    isActive: boolean;
    timeRemaining: string;
    currentPrice: number;
    progressPercentage: number;
    lastAuctionPrice: number;
    lastAuctionName: string;
    nextAuctionStart: string;
  } | null;
  isLoading: boolean;
  compact?: boolean;
}

function StripBody({ kind, state, isLoading, compact }: StripBodyProps) {
  const { format } = useNumberFormat();
  const meta = META[kind];
  if (isLoading && !state) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border-subtle text-[11px] text-text-tertiary">
        <span>{meta.label}</span>
        <span>…</span>
      </div>
    );
  }
  if (!state) return null;

  const statusPill = state.isActive ? (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success font-medium shrink-0">
      Live
    </span>
  ) : (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-text-tertiary shrink-0">
      Between auctions
    </span>
  );

  const priceLine = state.isActive ? (
    <>
      <span className="mono text-[13px] font-semibold text-text-primary">
        {formatNumber(state.currentPrice, format, { maximumFractionDigits: 2 })} HYPE
      </span>
      <span className="text-[10.5px] text-text-tertiary">{state.timeRemaining} left</span>
    </>
  ) : (
    <>
      <span className="mono text-[13px] font-semibold text-text-primary">
        {formatNumber(state.currentPrice, format, { maximumFractionDigits: 0 })} HYPE
      </span>
      <span className="text-[10.5px] text-text-tertiary">next {state.nextAuctionStart}</span>
    </>
  );

  if (compact) {
    return (
      <Link
        href={meta.href}
        className="flex items-center gap-x-2 gap-y-1 flex-wrap px-3.5 py-2.5 border-t border-border-subtle hover:bg-surface-2/60 transition-colors"
      >
        <span className="text-[10.5px] uppercase tracking-wide text-text-tertiary shrink-0">Deploy auction</span>
        {statusPill}
        {priceLine}
      </Link>
    );
  }

  return (
    <Link
      href={meta.href}
      className="block px-3.5 py-2.5 border-t border-border-subtle hover:bg-surface-2/60 transition-colors"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10.5px] uppercase tracking-wide text-text-tertiary shrink-0">{meta.label}</span>
        {statusPill}
        {priceLine}
        {state.lastAuctionName && (
          <span className="mono text-[10.5px] text-text-tertiary hidden sm:inline">
            last {state.lastAuctionName} · {formatNumber(state.lastAuctionPrice, format, { maximumFractionDigits: 0 })} HYPE
          </span>
        )}
        <span className="ml-auto text-[11px] text-brand shrink-0">Auctions →</span>
      </div>
      {state.isActive && (
        <span className="block h-1 rounded-full bg-surface-2 overflow-hidden mt-2">
          <span
            className="block h-full bg-gold"
            style={{ width: `${Math.max(0, Math.min(100, state.progressPercentage))}%` }}
          />
        </span>
      )}
    </Link>
  );
}

/**
 * Auction strip pinned under the venue tables (verdict adjustment): the two
 * auction types live with their venue — HIP-1 ticker auction under Spot,
 * HIP-3 perp deploy under Perpetuals (and recalled under PerpDexs).
 */
export function AuctionStrip({ kind, compact }: AuctionStripProps) {
  return kind === "spot" ? <SpotStripData compact={compact} /> : <PerpStripData compact={compact} />;
}
