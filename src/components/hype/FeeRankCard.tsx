"use client";

import { memo } from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useFeeRank } from "@/services/market/feeRank";

/**
 * Fee rank — Hyperliquid's place in the whole field.
 *
 * One ordinal, stated plainly: where the venue sits when every protocol
 * DefiLlama tracks is sorted by trailing-24h fees. The claim is the position,
 * not the dollar figure, so the rank leads and the fees that produce it sit
 * beside it as the basis.
 *
 * Self-gating: the card renders nothing on an error or before the ranking is
 * computed, rather than showing a placeholder ordinal. A rank is a fact — an
 * invented one is worse than an absent card.
 */
export const FeeRankCard = memo(function FeeRankCard() {
  const { data, error } = useFeeRank();

  // No fabricated numbers: only render once we hold a real, computed rank.
  if (error || !data) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Trophy size={13} className="text-brand" />
        </span>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[13px] font-semibold text-text-primary leading-tight">Fee rank</h3>
          <span className="text-[10.5px] text-text-tertiary truncate">
            Hyperliquid vs every protocol on DefiLlama
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <KpiRibbon
          cells={[
            {
              label: "Fee rank",
              value: `#${data.rank}`,
              sub: `of ${data.protocolCount} protocols`,
            },
            {
              label: "Hyperliquid fees 24h",
              value: compactUsd(data.hlFees24h),
              tone: "gold",
            },
          ]}
        />
      </div>
    </Card>
  );
});
