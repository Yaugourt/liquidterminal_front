"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, SourceBadge } from "@/components/common";
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
      <CardHead
        title="Fee rank"
        subtitle="Hyperliquid vs every protocol on DefiLlama"
        actions={<SourceBadge source="defillama" status="ok" />}
      />

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
