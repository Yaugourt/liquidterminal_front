"use client";

import { memo, useMemo } from "react";
import { Gavel, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useAuctionTiming,
  usePerpAuctionTiming,
  useAuctions,
} from "@/services/market/auction";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, compactUsd } from "@/lib/formatters/numberFormatting";
import type { AuctionState, AuctionInfo } from "@/services/market/auction";
import type { PastAuctionPerp } from "@/services/market/perpDex/types";

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

/** Montant de gas compact : "12.4K" / "1.20M" / "9.10". */
function compactGas(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n >= 1 ? n.toFixed(0) : n.toFixed(2);
}

/** Âge compact relatif : "12s" / "4m" / "2h" / "1d". */
function timeAgo(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Coût d'un déploiement spot — gas dans la devise de l'auction (HYPE / USDC). */
function formatSpotCost(a: AuctionInfo): string {
  return `${compactGas(parseFloat(a.deployGasAbs))} ${a.currency}`;
}

/** Coût d'un déploiement perp — gas d'auction en HYPE. */
function formatPerpCost(a: PastAuctionPerp): string {
  return a.maxGas != null ? `${compactGas(a.maxGas)} HYPE` : "—";
}

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
        <span className="w-8 h-8 rounded-md bg-brand/10 border border-brand/20 grid place-items-center shrink-0 text-[10px] font-bold text-brand">
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
      <span className="w-[30px] h-[30px] rounded-md bg-surface-2 border border-border-default grid place-items-center shrink-0">
        <Clock size={15} className="text-brand" />
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

/** Élément normalisé du flux "Last deploys" (spot ou perp). */
interface DeployItem {
  key: string;
  label: string;
  cost: string;
  dateMs: number;
}

type AuctionMarket = "spot" | "perp";

/**
 * AuctionsPanel — carte d'auction d'UN marché (spot ou perp), conçue pour
 * se placer à droite de la table Trending correspondante. Sous le bloc
 * d'auction, les 2 derniers déploiements du marché.
 */
export const AuctionsPanel = memo(function AuctionsPanel({
  market,
}: {
  market: AuctionMarket;
}) {
  const { auctionState: spotState } = useAuctionTiming();
  const { auctionState: perpState } = usePerpAuctionTiming();
  const { auctions: spotDeploys } = useAuctions({ currency: "ALL", limit: 6 });
  const { auctions: perpDeploys } = usePastAuctionsPerp();

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
          priceUnit: "USDC",
          initials: "P3",
        };

  /** Les 2 derniers déploiements du marché de la carte. */
  const deploys = useMemo<DeployItem[]>(() => {
    if (market === "spot") {
      return spotDeploys.slice(0, 2).map((a) => ({
        key: `${a.tokenId}-${a.index}`,
        label: a.name,
        cost: formatSpotCost(a),
        dateMs: a.time * 1000,
      }));
    }
    return [...perpDeploys]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 2)
      .map((a) => ({
        key: a.hash,
        label: a.symbol,
        cost: formatPerpCost(a),
        dateMs: a.time.getTime(),
      }));
  }, [market, spotDeploys, perpDeploys]);

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

      {/* Last deploys — 2 derniers déploiements, en pied de carte */}
      <div className="mt-auto border-t border-border-subtle px-3 py-2.5">
        <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1.5">
          Last deploys
        </div>
        {deploys.length === 0 ? (
          <div className="text-[10px] text-text-tertiary py-1">No recent deploys</div>
        ) : (
          deploys.map((d) => (
            <div key={d.key} className="flex items-center gap-2 py-1 text-[11px]">
              <span className="w-5 h-5 rounded bg-surface-2 grid place-items-center text-[8px] font-bold text-text-secondary shrink-0">
                {d.label.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-medium text-text-primary truncate">{d.label}</span>
              <span className="mono text-text-secondary ml-auto whitespace-nowrap">
                {d.cost}
              </span>
              <span className="mono text-[9px] text-text-tertiary whitespace-nowrap">
                {timeAgo(d.dateMs)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
});
