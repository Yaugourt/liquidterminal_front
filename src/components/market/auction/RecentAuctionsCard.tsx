"use client";

import { Gavel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuctions } from "@/services/market/auction/hooks/useAuctions";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";

/** Les 5 dernières auctions — carte compacte, à placer à côté de l'AuctionCard. */
export function RecentAuctionsCard() {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const { auctions, isLoading, error } = useAuctions({
    currency: "ALL",
    limit: 5,
    defaultParams: { sortBy: "time", sortOrder: "desc" },
  });

  const recent = auctions.slice(0, 5);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
          <Gavel className="w-3.5 h-3.5 text-brand" />
        </div>
        <h3 className="text-xs font-medium text-text-primary tracking-tight">
          Recent Auctions
        </h3>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-border-subtle">
        {isLoading && recent.length === 0 ? (
          <LoadingState size="sm" withCard={false} />
        ) : error ? (
          <p className="px-4 py-6 text-center text-sm text-text-tertiary">
            Failed to load auctions
          </p>
        ) : recent.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-tertiary">
            No recent auctions
          </p>
        ) : (
          recent.map((a) => (
            <div
              key={`${a.tokenId}-${a.index}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 flex-1"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {a.name}
                </div>
                <div className="mono text-[11px] text-text-tertiary">
                  {formatDateTime(a.time, dateFormat)}
                </div>
              </div>
              <span className="mono text-xs text-text-secondary shrink-0">
                {formatNumber(parseFloat(a.deployGas), format, {
                  maximumFractionDigits: 2,
                })}{" "}
                {a.currency}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
