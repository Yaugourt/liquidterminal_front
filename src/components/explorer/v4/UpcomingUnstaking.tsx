"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useUnstakingQueuePaginated } from "@/services/explorer/validator/hooks/staking/useUnstakingQueuePaginated";
import {
  CardHead,
  ModuleTable,
  ModuleTableRow,
} from "@/components/common";
import { compactHype, formatNumber, truncateAddress } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * UpcomingUnstaking — Top-N biggest pending HYPE unstakings.
 *
 * Source: `/staking/unstaking-queue` via the existing
 * `useUnstakingQueuePaginated` hook. We fetch a large enough page (100)
 * and sort client-side by amount DESC since the backend doesn't expose a
 * sort param yet. Refresh follows the hook's default 10 s cadence.
 */

const TOP_N = 5; // aligned with ValidatorsModule so both cards share row count + density
const FETCH_LIMIT = 200; // backend Zod cap; covers the heaviest unstakes

/** "in 3d 4h" / "in 2h 14m" / "in 8m" / "released" — relative to `now`. */
function releaseEta(releaseMs: number): string {
  const diff = releaseMs - Date.now();
  if (diff <= 0) return "released";
  const totalMin = Math.floor(diff / 60_000);
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const minutes = totalMin % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

export const UpcomingUnstaking = memo(function UpcomingUnstaking() {
  const { format } = useNumberFormat();
  const { unstakingQueue, total, isLoading } = useUnstakingQueuePaginated({
    limit: FETCH_LIMIT,
  });

  // Backend returns items sorted by date desc — sort by amount desc for the
  // "biggest pending" lens, then slice.
  const top = useMemo(
    () =>
      [...unstakingQueue]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, TOP_N),
    [unstakingQueue],
  );

  const hasData = top.length > 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Upcoming Unstakings"
        tag={
          total > 0
            ? `Top ${TOP_N} of ${formatNumber(total, format, { maximumFractionDigits: 0 })}`
            : `Top ${TOP_N} by size`
        }
        href="/explorer/validator"
      />

      {isLoading && top.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          Loading unstaking queue…
        </div>
      ) : !hasData ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          No upcoming unstakings
        </div>
      ) : (
        <ModuleTable
          columns={[
            { header: "Address", align: "left" },
            { header: "Amount",  align: "right" },
            { header: "Release", align: "right" },
          ]}
        >
          {top.map((item, i) => (
            <ModuleTableRow
              key={`${item.user}-${item.timestamp}-${i}`}
              cells={[
                <span key="addr" className="mono text-brand">
                  {truncateAddress(item.user)}
                </span>,
                <span key="amount" className="mono text-gold font-semibold">
                  {compactHype(item.amount)}{" "}
                  <span className="text-text-tertiary font-normal text-[10px]">
                    HYPE
                  </span>
                </span>,
                <span key="release" className="mono text-text-tertiary">
                  {releaseEta(item.timestamp)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      )}
    </Card>
  );
});
