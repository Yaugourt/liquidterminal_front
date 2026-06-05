"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { useHip4OrderBook } from "@/services/indexer/hip4";
import type { Hip4BookLevel } from "@/services/indexer/hip4";

interface Hip4OrderBookProps {
  coin: string;
  /** Side label for the header (e.g. "Yes", "San Antonio"). */
  sideName?: string | null;
  enabled?: boolean;
  /** How many price levels per side to show. */
  depth?: number;
}

interface Row {
  px: number;
  sz: number;
  cum: number;
}

function buildRows(levels: Hip4BookLevel[], depth: number): { rows: Row[]; maxCum: number } {
  let cum = 0;
  const rows: Row[] = [];
  for (const lvl of levels.slice(0, depth)) {
    const sz = parseFloat(lvl.sz);
    const px = parseFloat(lvl.px);
    if (!Number.isFinite(px) || !Number.isFinite(sz)) continue;
    cum += sz;
    rows.push({ px, sz, cum });
  }
  return { rows, maxCum: cum };
}

function cents(px: number): string {
  return `${(px * 100).toFixed(1)}¢`;
}

/**
 * Live L2 order book for a HIP-4 outcome coin — the panel that previously showed
 * an "unavailable" placeholder. Sourced over REST (`l2Book`) since `#NNN` coins
 * aren't on the shared market WS. Degrades to an honest placeholder for
 * expired/untradeable coins (which return no book). Prices are implied
 * probability (¢ = % chance).
 */
export function Hip4OrderBook({ coin, sideName, enabled = true, depth = 9 }: Hip4OrderBookProps) {
  const { bids, asks, mid, spread, spreadPct, available, isLoading } = useHip4OrderBook(
    coin,
    enabled
  );

  const askData = useMemo(() => buildRows(asks, depth), [asks, depth]);
  const bidData = useMemo(() => buildRows(bids, depth), [bids, depth]);
  const maxCum = Math.max(askData.maxCum, bidData.maxCum, 1);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
          <BookOpen size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Order Book</h3>
        {sideName && (
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
            {sideName}
          </span>
        )}
        {available && spread != null && (
          <span className="ml-auto mono text-[10.5px] text-text-tertiary">
            Spread {(spread * 100).toFixed(1)}¢
            {spreadPct != null ? ` · ${spreadPct.toFixed(1)}%` : ""}
          </span>
        )}
      </div>

      {isLoading && !available ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <InlineSpinner className="h-5 w-5 text-brand" />
        </div>
      ) : !available ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
          <p className="text-[12px] font-semibold text-text-secondary">No live book</p>
          <p className="max-w-[200px] text-[11px] text-text-tertiary">
            This outcome isn&apos;t actively quoted. See recent fills below for its latest trades.
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-2">
          <div className="grid grid-cols-3 px-2 pb-1 text-[9.5px] font-semibold uppercase tracking-wider text-text-tertiary">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks — best (lowest) ask nearest the mid, so render reversed. */}
          <div className="flex flex-col-reverse">
            {askData.rows.map((r, i) => (
              <BookRow key={`a-${i}`} row={r} maxCum={maxCum} tone="danger" />
            ))}
          </div>

          <div className="my-1 flex items-center justify-between rounded bg-surface-2 px-2 py-1">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-text-tertiary">
              Mid
            </span>
            <span className="mono text-[12px] font-semibold text-text-primary">
              {mid != null ? cents(mid) : "—"}
            </span>
          </div>

          {/* Bids — best (highest) bid nearest the mid. */}
          <div className="flex flex-col">
            {bidData.rows.map((r, i) => (
              <BookRow key={`b-${i}`} row={r} maxCum={maxCum} tone="success" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function BookRow({ row, maxCum, tone }: { row: Row; maxCum: number; tone: "success" | "danger" }) {
  const ratio = Math.max(0, Math.min(1, row.cum / maxCum));
  const barClass = tone === "success" ? "bg-success/10" : "bg-danger/10";
  const pxClass = tone === "success" ? "text-success" : "text-danger";
  return (
    <div className="relative">
      <div
        className={`absolute inset-y-0 right-0 ${barClass}`}
        style={{ width: `${ratio * 100}%` }}
        aria-hidden
      />
      <div className="relative grid grid-cols-3 px-2 py-[3px] text-[11px]">
        <span className={`mono font-semibold ${pxClass}`}>{cents(row.px)}</span>
        <span className="mono text-right text-text-secondary">{compactCount(row.sz)}</span>
        <span className="mono text-right text-text-tertiary">{compactCount(row.cum)}</span>
      </div>
    </div>
  );
}
