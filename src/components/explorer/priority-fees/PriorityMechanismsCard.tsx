"use client";

import { memo } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

const DOCS_URL =
  "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees";

/** Roughly a day of silence before a three-minute auction cycle counts as stalled. */
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface PriorityMechanismsCardProps {
  /** Newest gossip snapshot, or null when the feed carries none. */
  gossipLastSnapshotMs: number | null;
  isLoading: boolean;
}

/**
 * What this page counts, and what it does not.
 *
 * HyperCore burns HYPE through two separate priority mechanisms and the numbers
 * above cover exactly one of them. Saying so is not a disclaimer: a reader
 * comparing our burn against a source that sums both would otherwise conclude
 * we are undercounting the protocol rather than measuring a different thing.
 */
export const PriorityMechanismsCard = memo(function PriorityMechanismsCard({
  gossipLastSnapshotMs,
  isLoading,
}: PriorityMechanismsCardProps) {
  const gossipStale =
    gossipLastSnapshotMs !== null && Date.now() - gossipLastSnapshotMs > STALE_AFTER_MS;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <BookOpen size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Two burns, one name</h3>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[11px] font-medium text-brand hover:text-brand-hover"
        >
          Protocol docs
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ArrowUpFromLine size={12} className="text-gold shrink-0" />
            <span className="text-[12px] font-semibold text-text-primary">Order priority</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25">
              counted
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-secondary">
            Up to 8 bps of notional, charged from undelegated staking balance and taken whether or
            not the order fills. Buys queue position on the write path. Everything above measures
            this.
          </p>
        </div>

        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ArrowDownToLine size={12} className="text-text-tertiary shrink-0" />
            <span className="text-[12px] font-semibold text-text-primary">Gossip priority</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
              not counted
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-secondary">
            Dutch auctions on a three-minute cycle selling faster market-data reads, charged from
            spot balance, each resetting at 10x its last winning bid above a 0.1 HYPE floor. Buys
            queue position on the read path.
          </p>
          {!isLoading && (
            <p className="flex items-start gap-1 text-[10px] text-warning">
              <AlertTriangle size={10} className="shrink-0 mt-0.5" />
              <span>
                {gossipLastSnapshotMs === null
                  ? "The auction feed carries no snapshots, so this burn cannot be sized."
                  : gossipStale
                    ? `The auction feed has not moved since ${formatDay(gossipLastSnapshotMs)}, and it reports winning nodes by IP rather than by wallet.`
                    : `The auction feed is current as of ${formatDay(gossipLastSnapshotMs)} but reports winning nodes by IP rather than by wallet.`}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        HyperEVM priority fees are a third, unrelated stream and are in neither column.
      </div>
    </Card>
  );
});
