"use client";

import { memo, useState } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddressIdenticon, ModuleTable, ModuleTableRow, type ModuleColumn } from "@/components/common";
import { TokenAvatar } from "@/components/common";
import Link from "next/link";
import { compactUsd, truncateAddress } from "@/lib/formatters/numberFormatting";
import {
  usePriorityFeesRecentFills,
  extractFillPriorityGas,
  type PriorityFeesFillRow,
} from "@/services/explorer/priority-fees";
import {
  formatFillSideLabel,
  formatPriorityFeeNumber,
  hypeToUsd,
  isFillSideBuy,
  isFillSideSell,
  toFiniteNumber,
} from "./priority-fees-format";

const PAGE_SIZE = 12;

const COLUMNS: ModuleColumn[] = [
  { header: "Time", width: 84, align: "left" },
  { header: "Market", align: "left" },
  { header: "Side", width: 54 },
  { header: "Size", width: 96 },
  { header: "Priority gas", width: 116 },
  { header: "Payer", width: 118 },
];

function formatFillTime(t: unknown): string {
  const ms =
    typeof t === "number" && Number.isFinite(t)
      ? t < 1e12
        ? t * 1000
        : t
      : typeof t === "string"
        ? Date.parse(t)
        : NaN;
  if (!Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}

/** Notional in USD, when both legs of the fill are present. */
function fillNotional(row: PriorityFeesFillRow): number | null {
  const px = toFiniteNumber(row.px);
  const sz = toFiniteNumber(row.sz);
  return px > 0 && sz > 0 ? px * sz : null;
}

export interface PriorityFillsCardProps {
  hypeUsd: number | null;
}

/**
 * The live tape of fills that paid for priority.
 *
 * Sits next to the aggregates so a reader can check the shape of the burn
 * against individual prints: the same 24 h average comes out of thousands of
 * dust bids or a handful of large ones, and only the tape distinguishes them.
 */
export const PriorityFillsCard = memo(function PriorityFillsCard({
  hypeUsd,
}: PriorityFillsCardProps) {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { data, isLoading, error, refetch } = usePriorityFeesRecentFills({
    limit: PAGE_SIZE,
    offset,
    has_priority_gas: true,
  });

  const hasNext = data.length === PAGE_SIZE;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Fills paying priority</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          live
        </span>
      </div>

      {error && (
        <div className="mx-3.5 mt-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          <button type="button" onClick={() => refetch()} className="text-brand hover:underline">
            Retry
          </button>
        </div>
      )}

      {data.length === 0 ? (
        <div className="flex-1 min-h-[200px] grid place-items-center text-xs text-text-tertiary">
          {isLoading ? "Loading fills…" : "No fill paid priority on this page."}
        </div>
      ) : (
        /* Six fixed columns outgrow a phone; scroll the table rather than clip it. */
        <div className="overflow-x-auto">
          <ModuleTable columns={COLUMNS} density="compact">
            {data.map((row, index) => {
              const gas = extractFillPriorityGas(row);
              const gasUsd = hypeToUsd(Number.isFinite(gas) ? gas : null, hypeUsd);
              const notional = fillNotional(row);
              const payer = String(row.user ?? "").trim();
              const sideClass = isFillSideBuy(row.side)
                ? "text-success"
                : isFillSideSell(row.side)
                  ? "text-danger"
                  : "text-text-secondary";

              return (
                <ModuleTableRow
                  key={`${String(row.hash ?? row.tid ?? index)}-${offset + index}`}
                  cells={[
                    <span key="t" className="mono text-[11px] text-text-tertiary">
                      {formatFillTime(row.time)}
                    </span>,
                    <span key="c" className="flex items-center gap-1.5 min-w-0">
                      {row.coin && <TokenAvatar assetName={row.coin} size="sm" />}
                      <span className="text-[12px] text-text-primary truncate">{row.coin ?? "—"}</span>
                    </span>,
                    <span key="s" className={`text-[12px] ${sideClass}`}>
                      {formatFillSideLabel(row.side)}
                    </span>,
                    <span key="n" className="mono text-[12px] text-text-secondary">
                      {notional === null ? "—" : compactUsd(notional)}
                    </span>,
                    <span key="g" className="mono text-[12px] text-gold">
                      {formatPriorityFeeNumber(Number.isFinite(gas) ? gas : undefined)}
                      {gasUsd !== null && (
                        <span className="block text-[10px] text-text-tertiary">
                          {compactUsd(gasUsd)}
                        </span>
                      )}
                    </span>,
                    payer ? (
                      <Link
                        key="u"
                        href={`/explorer/address/${payer}`}
                        className="flex items-center justify-end gap-1.5 min-w-0 group"
                      >
                        <AddressIdenticon address={payer} size={16} />
                        <span className="mono text-[11px] text-text-secondary truncate group-hover:text-brand transition-colors">
                          {truncateAddress(payer)}
                        </span>
                      </Link>
                    ) : (
                      <span key="u" className="text-text-tertiary">
                        —
                      </span>
                    ),
                  ]}
                />
              );
            })}
          </ModuleTable>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-t border-border-subtle">
        <span className="text-[10px] text-text-tertiary">
          {PAGE_SIZE} per page · times UTC · size is fill notional
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 border-border-subtle bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="mono text-[11px] text-text-secondary min-w-[3rem] text-center">
            {page + 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 border-border-subtle bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            disabled={!hasNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
});
