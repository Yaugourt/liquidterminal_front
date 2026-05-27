"use client";

import { memo } from "react";
import { Gavel, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useAuctionTiming,
  usePerpAuctionTiming,
} from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, compactUsd } from "@/lib/formatters/numberFormatting";
import type { AuctionState } from "@/services/market/auction";

interface AuctionLiveBlockProps {
  name: string;
  tag: string;
  auctionState: AuctionState;
  priceUnit: string;
  /** Initiales pour le logo carré (ex: "SP"). */
  initials: string;
}

const price2 = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

/**
 * AuctionLiveBlock — bloc "auction-live" de la maquette : fond dégradé léger,
 * auc-top (logo + nom + timer), auc-price, barre de progression.
 */
function AuctionLiveBlock({
  name,
  tag,
  auctionState,
  priceUnit,
  initials,
}: AuctionLiveBlockProps) {
  const { format } = useNumberFormat();

  return (
    <div className="px-3 py-3 bg-gradient-to-b from-brand/5 to-transparent">
      {/* auc-top */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0 text-[9px] font-semibold text-brand">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-text-primary leading-tight truncate">
            {name}
          </div>
          <div className="text-[10px] text-text-tertiary truncate">{tag} deployment</div>
        </div>
        <div className="ml-auto text-right shrink-0">
          <div className="mono text-[13px] font-semibold tracking-[-0.01em] text-gold leading-none">
            {auctionState.timeRemaining}
          </div>
          <div className="text-[8px] uppercase tracking-[0.06em] text-text-tertiary mt-0.5">
            Remaining
          </div>
        </div>
      </div>

      {/* auc-price */}
      <div className="flex items-end justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary mb-0.5">
            Current price
          </div>
          <div className="mono text-[16px] font-semibold tracking-[-0.02em] leading-none text-text-primary truncate">
            {formatNumber(auctionState.currentPrice, format, price2)}{" "}
            <span className="text-[10px] text-text-tertiary font-normal">
              {priceUnit}
            </span>
          </div>
        </div>
        <div className="mono text-[10px] text-text-tertiary shrink-0">
          ≈ {compactUsd(auctionState.currentPriceUSD)}
        </div>
      </div>

      {/* progress */}
      <div className="h-1.5 rounded bg-base border border-border-default overflow-hidden">
        <i
          className="block h-full rounded bg-gradient-to-r from-brand-deep to-brand"
          style={{ width: `${auctionState.progressPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[9px] text-text-tertiary">
        <span>Progress</span>
        <span className="mono">
          {formatNumber(auctionState.progressPercentage, format, {
            maximumFractionDigits: 0,
          })}
          %
        </span>
      </div>

      {/* stats — Dutch curve anchors + recent settlement context */}
      <div className="mt-2.5 grid grid-cols-3 gap-x-2 gap-y-6 pt-2.5 border-t border-border-subtle">
        <AuctionStat label="Start" value={formatNumber(auctionState.startPrice, format, { maximumFractionDigits: 0 })} unit={priceUnit} />
        <AuctionStat label="Floor" value={formatNumber(auctionState.floorPrice, format, { maximumFractionDigits: 0 })} unit={priceUnit} />
        <AuctionStat
          label="Last sold"
          value={formatNumber(auctionState.lastAuctionPrice, format, { maximumFractionDigits: 0 })}
          unit={priceUnit}
          hint={auctionState.lastAuctionName !== "N/A" ? auctionState.lastAuctionName : undefined}
        />
        <AuctionStat
          label="7d avg"
          value={
            auctionState.avg7dPrice > 0
              ? formatNumber(auctionState.avg7dPrice, format, { maximumFractionDigits: 0 })
              : "—"
          }
          unit={auctionState.avg7dPrice > 0 ? priceUnit : ""}
        />
        <AuctionStat
          label="Deploys 7d"
          value={auctionState.deploys7d > 0 ? String(auctionState.deploys7d) : "—"}
          unit=""
        />
        <AuctionStat
          label="ETA → last"
          value={auctionState.etaToLastSold}
          unit=""
          accent={auctionState.etaToLastSold === "Now"}
        />
      </div>
    </div>
  );
}

/** Mini stat cell rendered in the auction live block (label · value · unit). */
function AuctionStat({
  label,
  value,
  unit,
  hint,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-1 text-[9px] uppercase tracking-[0.06em] text-text-tertiary">
        <span className="truncate">{label}</span>
        {hint && (
          <span className="mono normal-case tracking-normal text-text-secondary truncate">
            {hint}
          </span>
        )}
      </div>
      <div
        className={`mono text-[12px] font-semibold leading-tight truncate ${
          accent ? "text-success" : "text-text-primary"
        }`}
      >
        {value}
        {unit && (
          <span className="text-[9px] text-text-tertiary font-normal ml-1">{unit}</span>
        )}
      </div>
    </div>
  );
}

interface AuctionNextRowProps {
  name: string;
  tag: string;
  auctionState: AuctionState;
  priceUnit: string;
}

/**
 * AuctionNextRow — ligne "auc-next" : icône + libellé + délai du prochain
 * créneau, avec le prix de départ réel en sous-ligne.
 */
function AuctionNextRow({ name, tag, auctionState, priceUnit }: AuctionNextRowProps) {
  const { format } = useNumberFormat();

  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
        <Clock size={13} className="text-brand" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-text-primary">
          {name} · {tag}
        </div>
        <div className="text-[10px] text-text-tertiary">
          Start{" "}
          <span className="mono">
            {formatNumber(auctionState.currentPrice, format, price2)} {priceUnit}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="mono text-[12px] font-semibold text-text-secondary whitespace-nowrap">
          {auctionState.nextAuctionStart}
        </div>
        <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary mt-0.5">
          Opens in
        </div>
      </div>
    </div>
  );
}

interface AuctionEntry {
  name: string;
  tag: string;
  auctionState: AuctionState;
  priceUnit: string;
  initials: string;
}

/** Rend une auction : bloc "live" si active, sinon ligne "next". */
function AuctionRow({ entry }: { entry: AuctionEntry }) {
  return entry.auctionState.isActive ? (
    <AuctionLiveBlock
      name={entry.name}
      tag={entry.tag}
      auctionState={entry.auctionState}
      priceUnit={entry.priceUnit}
      initials={entry.initials}
    />
  ) : (
    <AuctionNextRow
      name={entry.name}
      tag={entry.tag}
      auctionState={entry.auctionState}
      priceUnit={entry.priceUnit}
    />
  );
}

type AuctionMarket = "spot" | "perp";

/**
 * AuctionsPanel — carte d'auction d'UN marché (spot ou perp). Affiche le
 * bloc auction-live (timer + prix + barre de progression). Les past deploys
 * sont rendus séparément par `PastAuctionsCard` / `Hip3PastAuctionsCard`.
 */
export const AuctionsPanel = memo(function AuctionsPanel({
  market,
}: {
  market: AuctionMarket;
}) {
  const { auctionState: spotState } = useAuctionTiming();
  const { auctionState: perpState } = usePerpAuctionTiming();

  const entry: AuctionEntry =
    market === "spot"
      ? {
          name: "Spot Deploy",
          tag: "Spot",
          auctionState: spotState,
          priceUnit: "HYPE",
          initials: "SP",
        }
      : {
          name: "Perp Deploy",
          tag: "HIP-3",
          auctionState: perpState,
          priceUnit: "HYPE",
          initials: "P3",
        };

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head V4 — badge LIVE si l'auction est active */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Gavel size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          {market === "spot" ? "Spot Auction" : "Perp Auction"}
        </h3>
        {entry.auctionState.isActive && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <AuctionRow entry={entry} />
    </Card>
  );
});
