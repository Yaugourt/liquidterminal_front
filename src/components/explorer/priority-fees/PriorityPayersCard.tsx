"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  AddressIdenticon,
  ModuleTable,
  ModuleTableRow,
  StackedShareBar,
  type ModuleColumn,
} from "@/components/common";
import { compactCount, compactHype, compactUsd, truncateAddress } from "@/lib/formatters/numberFormatting";
import type { PriorityFeesLeaderboardEntry } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber, formatShare, hypeToUsd, toFiniteNumber } from "./priority-fees-format";

const TOP_N = 12;
/** Rows folded into the concentration bar's leading segment. */
const CONCENTRATION_HEAD = 10;

const COLUMNS: ModuleColumn[] = [
  { header: "#", width: 34, align: "left" },
  { header: "Payer", align: "left" },
  { header: "Gas", width: 108 },
  { header: "Share", width: 66 },
  { header: "Fills", width: 76 },
  { header: "Avg/fill", width: 92 },
];

function entryAddress(row: PriorityFeesLeaderboardEntry): string {
  return String(row.user ?? row.address ?? "").trim();
}

function entryGas(row: PriorityFeesLeaderboardEntry): number {
  return toFiniteNumber(row.total_priority_gas ?? row.priority_fees ?? row.score ?? row.value);
}

export interface PriorityPayersCardProps {
  entries: PriorityFeesLeaderboardEntry[];
  /** Window-wide burn, so a row's share is measured against everyone, not just the top N. */
  windowGas: number | null;
  hypeUsd: number | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

/**
 * Who actually pays for priority.
 *
 * The concentration bar above the table is the reading that matters: order
 * priority is not a cost the market shares, it is one a handful of desks carry,
 * and a leaderboard alone hides that by making rank 12 look like the tail of a
 * long distribution rather than most of the way to the end of it.
 */
export const PriorityPayersCard = memo(function PriorityPayersCard({
  entries,
  windowGas,
  hypeUsd,
  isLoading,
  error,
  onRetry,
}: PriorityPayersCardProps) {
  const { rows, headGas, restGas } = useMemo(() => {
    const ranked = entries
      .map((entry) => ({ address: entryAddress(entry), gas: entryGas(entry), fills: toFiniteNumber(entry.fill_count) }))
      .filter((row) => row.address !== "")
      .sort((a, b) => b.gas - a.gas);

    const head = ranked.slice(0, CONCENTRATION_HEAD).reduce((acc, row) => acc + row.gas, 0);
    // Everyone outside the head, including payers the leaderboard never returned.
    const total = windowGas ?? ranked.reduce((acc, row) => acc + row.gas, 0);

    return { rows: ranked.slice(0, TOP_N), headGas: head, restGas: Math.max(0, total - head) };
  }, [entries, windowGas]);

  const headShare = formatShare(headGas, headGas + restGas);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Crown size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Top payers</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          top {TOP_N}
        </span>
      </div>

      {rows.length > 0 && (
        <div className="px-3.5 py-2.5 border-b border-border-subtle bg-surface-2/30">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[11px] text-text-secondary">
              Top {CONCENTRATION_HEAD} pay <span className="mono text-gold font-semibold">{headShare}</span> of the burn
            </span>
            <span className="text-[10px] text-text-tertiary mono">
              {compactHype(headGas)} / {compactHype(headGas + restGas)} HYPE
            </span>
          </div>
          <StackedShareBar
            segments={[
              { key: "head", value: headGas, colorClass: "bg-gold", label: `Top ${CONCENTRATION_HEAD}` },
              { key: "rest", value: restGas, colorClass: "bg-surface-2", label: "Everyone else" },
            ]}
            height={6}
          />
        </div>
      )}

      {error && (
        <div className="mx-3.5 mt-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="text-brand hover:underline">
              Retry
            </button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex-1 min-h-[200px] grid place-items-center text-xs text-text-tertiary">
          {isLoading ? "Loading payers…" : "No payer paid priority in this window."}
        </div>
      ) : (
        /* Six fixed columns outgrow a phone; scroll the table rather than clip it. */
        <div className="overflow-x-auto">
          <ModuleTable columns={COLUMNS} density="compact">
            {rows.map((row, index) => {
              const usd = hypeToUsd(row.gas, hypeUsd);
              const avgPerFill = row.fills > 0 ? row.gas / row.fills : null;
              return (
                <ModuleTableRow
                  key={row.address}
                  cells={[
                    <span key="rank" className="text-text-tertiary mono text-[11px]">
                      {index + 1}
                    </span>,
                    <Link
                      key="payer"
                      href={`/explorer/address/${row.address}`}
                      className="flex items-center gap-2 min-w-0 group"
                    >
                      <AddressIdenticon address={row.address} size={18} />
                      <span className="mono text-[12px] text-text-primary truncate group-hover:text-brand transition-colors">
                        {truncateAddress(row.address)}
                      </span>
                    </Link>,
                    <span key="gas" className="mono text-[12px] text-gold">
                      {compactHype(row.gas)}
                      {usd !== null && (
                        <span className="block text-[10px] text-text-tertiary">{compactUsd(usd)}</span>
                      )}
                    </span>,
                    <span key="share" className="mono text-[12px] text-text-secondary">
                      {formatShare(row.gas, windowGas ?? headGas + restGas)}
                    </span>,
                    <span key="fills" className="mono text-[12px] text-text-secondary">
                      {compactCount(row.fills)}
                    </span>,
                    <span key="avg" className="mono text-[12px] text-text-secondary">
                      {avgPerFill === null ? "—" : formatPriorityFeeNumber(avgPerFill)}
                    </span>,
                  ]}
                />
              );
            })}
          </ModuleTable>
        </div>
      )}

      <div className="mt-auto px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        Ranked over the same window as the chart. Avg/fill separates desks that spray small bids from
        those that pay up on a few.
      </div>
    </Card>
  );
});
