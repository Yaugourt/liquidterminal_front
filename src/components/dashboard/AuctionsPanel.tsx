"use client";

import { memo } from "react";
import { Gavel } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useAuctionTiming,
  usePerpAuctionTiming,
  useAuctions,
} from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, compactUsd } from "@/lib/formatters/numberFormatting";
import type { AuctionState, AuctionInfo } from "@/services/market/auction";

interface AuctionBlockProps {
  name: string;
  tag: string;
  auctionState: AuctionState;
  priceUnit: string;
}

function AuctionBlock({ name, tag, auctionState, priceUnit }: AuctionBlockProps) {
  const { format } = useNumberFormat();

  const price2 = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  return (
    <div className="px-3.5 py-3 border-t border-border-subtle first:border-t-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-text-primary">
          {name}{" "}
          <span className="text-[11px] font-normal text-text-tertiary">/ {tag}</span>
        </span>
        {auctionState.isActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success">
            ● LIVE
          </span>
        ) : (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-3 text-text-tertiary">
            UPCOMING
          </span>
        )}
      </div>

      {auctionState.isActive ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Current price</span>
            <span className="mono text-[12px] text-text-primary">
              {formatNumber(auctionState.currentPrice, format, price2)} {priceUnit}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">≈ USD value</span>
            <span className="mono text-[12px] text-text-secondary">
              {compactUsd(auctionState.currentPriceUSD)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Time left</span>
            <span className="mono text-[12px] text-gold">{auctionState.timeRemaining}</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-tertiary">Progress</span>
            <span className="mono text-[12px] text-text-secondary">
              {formatNumber(auctionState.progressPercentage, format, {
                maximumFractionDigits: 1,
              })}
              %
            </span>
          </div>
          <div className="h-1.5 rounded bg-surface-3 overflow-hidden">
            <i
              className="block h-full bg-brand-deep"
              style={{ width: `${auctionState.progressPercentage}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Starts in</span>
            <span className="mono text-[12px] text-text-primary">
              {auctionState.nextAuctionStart}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Start price</span>
            <span className="mono text-[12px] text-text-primary">
              {formatNumber(auctionState.currentPrice, format, price2)} {priceUnit}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">≈ USD value</span>
            <span className="mono text-[12px] text-text-secondary">
              {compactUsd(auctionState.currentPriceUSD)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Last auction</span>
            <span className="mono text-[12px] text-text-primary">
              {auctionState.lastAuctionName}
              {" · "}
              {formatNumber(auctionState.lastAuctionPrice, format, price2)} {priceUnit}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** Formate un timestamp (secondes) en date courte JJ/MM. */
function formatShortDate(timeSeconds: number): string {
  if (!timeSeconds || !Number.isFinite(timeSeconds)) return "—";
  const date = new Date(timeSeconds * 1000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** Tronque une adresse de deployer pour l'affichage. */
function shortDeployer(address: string): string {
  if (!address) return "—";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/** Coût du déploiement, exprimé dans la devise de l'auction (HYPE / USDC). */
function formatDeployCost(a: AuctionInfo): string {
  const amount = parseFloat(a.deployGasAbs);
  if (!Number.isFinite(amount)) return "—";
  const compact =
    amount >= 1e6
      ? `${(amount / 1e6).toFixed(2)}M`
      : amount >= 1e3
        ? `${(amount / 1e3).toFixed(1)}K`
        : amount.toFixed(0);
  return `${compact} ${a.currency}`;
}

function RecentDeploysTable() {
  const { auctions, isLoading } = useAuctions({ currency: "ALL", limit: 6 });

  const rows: AuctionInfo[] = auctions.slice(0, 6);

  return (
    <div className="border-t border-border-subtle px-3.5 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Recent deploys
        </span>
        <span className="text-[10px] text-text-tertiary">latest {rows.length}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-[10px] uppercase tracking-[0.06em] text-text-tertiary pb-1.5 border-b border-border-subtle">
        <span>Token</span>
        <span className="text-right">Deployer</span>
        <span className="text-right">Date</span>
        <span className="text-right">Cost</span>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="py-3 text-center text-[11px] text-text-tertiary">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-3 text-center text-[11px] text-text-tertiary">No deploys</div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {rows.map((a) => (
            <div
              key={`${a.tokenId}-${a.index}`}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1.5"
            >
              <span className="text-[12px] font-medium text-text-primary truncate">
                {a.name}
              </span>
              <span className="mono text-[11px] text-text-secondary text-right">
                {shortDeployer(a.deployer)}
              </span>
              <span className="mono text-[11px] text-text-tertiary text-right whitespace-nowrap">
                {formatShortDate(a.time)}
              </span>
              <span className="mono text-[11px] text-text-primary text-right whitespace-nowrap">
                {formatDeployCost(a)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const AuctionsPanel = memo(function AuctionsPanel() {
  const { auctionState: spotState } = useAuctionTiming();
  const { auctionState: perpState } = usePerpAuctionTiming();

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Gavel size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Auctions</h3>
        </div>
      </div>

      <AuctionBlock
        name="Spot Deploy"
        tag="spot"
        auctionState={spotState}
        priceUnit="HYPE"
      />
      <AuctionBlock
        name="Perp Deploy"
        tag="HIP-3"
        auctionState={perpState}
        priceUnit="USDC"
      />

      <RecentDeploysTable />
    </Card>
  );
});
