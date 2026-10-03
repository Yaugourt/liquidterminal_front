"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { CardHeading, DataStatus, TokenAvatar } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { TwapBoard, TwapSide } from "@/services/dashboard/live/useTwapBoard";
import { FlowBar, TwapRow, signedUsd } from "./TwapFlowCard";

function MarketRow({ label, s }: { label: string; s: TwapSide }) {
  return (
    <div className="flex items-center gap-2 text-[11.5px]">
      <span className="w-[40px] shrink-0 text-text-tertiary uppercase text-[10px] tracking-[0.06em] font-semibold">{label}</span>
      <FlowBar buy={s.buyLeftUsd} sell={s.sellLeftUsd} className="h-1.5 flex-1 min-w-0" />
      <span className="mono text-text-secondary whitespace-nowrap">
        {s.count} · <span className={s.netUsd >= 0 ? "text-success" : "text-danger"}>{signedUsd(s.netUsd)}</span>
      </span>
    </div>
  );
}

/**
 * HYPE TWAPs, spot and perp together: is more HYPE left to buy or to sell
 * through TWAPs right now, and which ones.
 */
export const HypeTwapCard = memo(function HypeTwapCard({ board, isLoading }: { board: TwapBoard; isLoading: boolean }) {
  const { totals, spot, perp, active, started24h } = board.hype;
  const net = totals.netUsd;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<TokenAvatar assetName="HYPE" size="xs" />}
        title="HYPE TWAPs"
        meta="spot + perp"
        status={<DataStatus variant="polled" updatedAt={board.updatedAt} />}
      />
      <div className="px-3.5 pt-3 pb-2.5 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">Net left to execute</div>
        <div className={`mono text-[28px] font-semibold leading-none mt-1.5 ${net >= 0 ? "text-success" : "text-danger"}`}>
          {isLoading && !active.length ? "…" : signedUsd(net)}
        </div>
        <div className="mono text-[11px] text-text-tertiary mt-1.5">
          <span className="text-success">buy {compactUsd(totals.buyLeftUsd)}</span> ·{" "}
          <span className="text-danger">sell {compactUsd(totals.sellLeftUsd)}</span> · {totals.count} running
        </div>
        <div className="mt-2">
          <FlowBar buy={totals.buyLeftUsd} sell={totals.sellLeftUsd} className="h-2" />
        </div>
      </div>
      <div className="px-3.5 py-2.5 space-y-1.5 border-b border-border-subtle">
        <MarketRow label="Spot" s={spot} />
        <MarketRow label="Perp" s={perp} />
        <div className="text-[11px] text-text-tertiary pt-0.5">
          {started24h.count} HYPE TWAPs started in 24h · {compactUsd(started24h.usd)}
        </div>
      </div>
      <div className="px-3.5 py-2">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">Biggest running</div>
        {active.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-text-tertiary">{isLoading ? "Loading…" : "No HYPE TWAP running"}</div>
        ) : (
          <div className="h-[168px] overflow-y-auto scrollbar-brand pr-1">
            {active.slice(0, 8).map((t) => (
              <TwapRow key={t.hash} t={t} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});
