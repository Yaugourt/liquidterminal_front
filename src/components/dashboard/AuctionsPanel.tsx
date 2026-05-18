"use client";

import { memo } from "react";
import { Gavel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuctionTiming, usePerpAuctionTiming } from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import type { AuctionState } from "@/services/market/auction";

interface AuctionBlockProps {
  name: string;
  tag: string;
  auctionState: AuctionState;
  priceUnit: string;
}

function AuctionBlock({ name, tag, auctionState, priceUnit }: AuctionBlockProps) {
  const { format } = useNumberFormat();

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
              {formatNumber(auctionState.currentPrice, format, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {priceUnit}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-tertiary">Time left</span>
            <span className="mono text-[12px] text-gold">{auctionState.timeRemaining}</span>
          </div>
          <div className="h-1.5 rounded bg-surface-3 overflow-hidden mt-2">
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
            <span className="text-[11px] text-text-tertiary">Last auction</span>
            <span className="mono text-[12px] text-text-primary">
              {auctionState.lastAuctionName}
              {" · "}
              {formatNumber(auctionState.lastAuctionPrice, format, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {priceUnit}
            </span>
          </div>
        </>
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
    </Card>
  );
});
