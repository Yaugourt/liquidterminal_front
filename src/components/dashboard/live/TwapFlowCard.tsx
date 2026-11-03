"use client";

import { memo } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CardHead, DataStatus, KpiRibbon, TokenAvatar, type KpiCell } from "@/components/common";
import { compactUsd, formatPct, fullUsd } from "@/lib/formatters/numberFormatting";
import type { LiveTwap, TwapBoard } from "@/services/dashboard/live/useTwapBoard";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Time left: "6d 6h" / "2h 14m", then "12m 04s" in the last hour, which counts down by the second. */
export function timeLeft(end: number, now: number): string {
  const s = Math.max(0, Math.ceil((end - now) / 1000));
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
  const m = Math.round(s / 60);
  if (m >= 60 * 24) return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const signedUsd = (v: number) => `${v >= 0 ? "+" : "−"}${compactUsd(Math.abs(v))}`;

/** Buy share of a buy/sell pair as a two-colour bar. */
export function FlowBar({ buy, sell, className = "h-1.5" }: { buy: number; sell: number; className?: string }) {
  const total = buy + sell;
  return (
    <div className={`${className} rounded-full overflow-hidden flex bg-surface-2`}>
      {total > 0 && (
        <>
          <span className="bg-success" style={{ width: `${(buy / total) * 100}%` }} />
          <span className="bg-danger" style={{ width: `${(sell / total) * 100}%` }} />
        </>
      )}
    </div>
  );
}

/**
 * One running TWAP. First line: who, and what is left to execute in USD, to
 * the dollar so the drain shows as the board ticks each second. Second line:
 * the share executed as a bar, then the full size and the time left. Between
 * 1024 and 1279px the dashboard puts these rows in ~200px columns: the wallet
 * gives way there, and the full size is kept for screen readers and in the
 * amount's tooltip.
 */
export function TwapRow({ t, now }: { t: LiveTwap; now: number }) {
  return (
    <div className="py-1.5 border-t border-border-subtle first:border-t-0">
      <div className="flex items-center gap-1.5 text-[12px]">
        <Link
          href={`/market/${t.market === "spot" ? "spot" : "perp"}/${encodeURIComponent(t.coin)}`}
          className="inline-flex min-w-0 items-center gap-1.5 text-text-primary hover:text-brand font-medium"
        >
          <TokenAvatar assetName={t.coin} size="xs" />
          <span className="truncate">{t.coin}</span>
        </Link>
        <span className={`shrink-0 mono text-[10.5px] font-semibold ${t.isBuy ? "text-success" : "text-danger"}`}>{t.isBuy ? "BUY" : "SELL"}</span>
        <span className="shrink-0 mono text-[10px] text-text-tertiary uppercase">{t.market}</span>
        {/* Zero basis: the wallet only takes the room left over, so it gives way before the coin does. */}
        <span className="hidden sm:block lg:max-xl:hidden flex-1 basis-0 min-w-0 truncate">
          <Link href={`/market/tracker/wallet/${t.user}`} className="mono text-[11px] text-text-tertiary hover:text-brand">
            {short(t.user)}
          </Link>
        </span>
        <span className="ml-auto shrink-0 mono text-text-primary" title={`${fullUsd(t.remainingUsd)} left of ${fullUsd(t.totalUsd)}`}>
          {fullUsd(t.remainingUsd)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div
          className="flex-1 min-w-0 h-1 rounded-full bg-surface-2 overflow-hidden"
          role="progressbar"
          aria-label="Share executed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t.doneFraction * 100)}
          title={`${formatPct(t.doneFraction)} executed`}
        >
          <span className={`block h-full ${t.isBuy ? "bg-success/70" : "bg-danger/70"}`} style={{ width: `${t.doneFraction * 100}%` }} />
        </div>
        <span className="shrink-0 mono text-[10.5px] text-text-tertiary whitespace-nowrap">
          <span className="lg:max-xl:sr-only">of {compactUsd(t.totalUsd)} · </span>
          {timeLeft(t.endTime, now)} left
        </span>
      </div>
    </div>
  );
}

/**
 * TWAP flow: the sliced orders running on Hyperliquid right now. What is
 * left to buy and to sell (from the executed size when known, otherwise
 * estimated from elapsed time), the coins with the most TWAP flow, and the
 * biggest TWAPs in progress.
 */
export const TwapFlowCard = memo(function TwapFlowCard({ board, isLoading }: { board: TwapBoard; isLoading: boolean }) {
  const { totals, started24h, byCoin, active, executed24hUsd, stalled } = board;
  const cells: KpiCell[] = [
    { key: "active", label: "Running now", value: isLoading && !active.length ? "…" : String(totals.count), sub: `${started24h.count} started in 24h${stalled > 0 ? ` · ${stalled} stalled` : ""}` },
    { key: "done", label: "Executed, 24h", value: executed24hUsd > 0 ? compactUsd(executed24hUsd) : "—", sub: "ended + running so far" },
    { key: "buy", label: "Left to buy", value: compactUsd(totals.buyLeftUsd), tone: "success", sub: "estimated" },
    { key: "sell", label: "Left to sell", value: compactUsd(totals.sellLeftUsd), tone: "danger", sub: "estimated" },
    {
      key: "net",
      label: "Net TWAP flow",
      value: signedUsd(totals.netUsd),
      tone: totals.netUsd >= 0 ? "success" : "danger",
      sub: totals.netUsd >= 0 ? "more buying left" : "more selling left",
    },
  ];
  const maxCoin = Math.max(1, ...byCoin.slice(0, 7).map((c) => c.buyLeftUsd + c.sellLeftUsd));

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="TWAP flow"
        tag="running now"
        href="/dashboard/market"
        viewAllLabel="All TWAPs"
        actions={board.isLive ? <DataStatus variant="live" /> : <DataStatus variant="polled" updatedAt={board.updatedAt} />}
      />
      <div className="p-3.5 pb-2">
        <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />
        <div className="mt-2.5">
          <FlowBar buy={totals.buyLeftUsd} sell={totals.sellLeftUsd} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border-subtle">
        <div className="px-3.5 py-2.5 md:border-r border-border-subtle">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1.5">Most TWAP flow · left to execute</div>
          {byCoin.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-text-tertiary">{isLoading ? "Loading TWAPs…" : "No TWAP running"}</div>
          ) : (
            <div className="space-y-1.5">
              {byCoin.slice(0, 7).map((c) => (
                <div key={c.coin} className="flex items-center gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1.5 w-[88px] shrink-0 min-w-0 text-text-primary font-medium truncate">
                    <TokenAvatar assetName={c.coin} size="xs" />
                    <span className="truncate">{c.coin}</span>
                  </span>
                  <div className="flex flex-1 min-w-0 h-2 rounded-full bg-surface-2 overflow-hidden" title={`${c.count} TWAP${c.count > 1 ? "s" : ""}`}>
                    <span className="bg-success" style={{ width: `${(c.buyLeftUsd / maxCoin) * 100}%` }} />
                    <span className="bg-danger" style={{ width: `${(c.sellLeftUsd / maxCoin) * 100}%` }} />
                  </div>
                  <span className={`mono text-right w-[72px] shrink-0 ${c.netUsd >= 0 ? "text-success" : "text-danger"}`}>{signedUsd(c.netUsd)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-3.5 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">Biggest running · left to execute</div>
          <div className="h-[196px] overflow-y-auto scrollbar-brand pr-1">
            {active.slice(0, 12).map((t) => (
              <TwapRow key={t.hash} t={t} now={board.now} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        New and ended TWAPs show up within seconds. Amounts left use the executed size when it is known (ended TWAPs, and running ones followed since their start, moved on by the clock until their next fill); otherwise they are estimated from the time elapsed (one slice every 30s). Both at the current price. A TWAP that stops filling and falls behind its schedule counts as stalled, not running. Source: our indexer, every TWAP of the last 24h plus those still running.
      </div>
    </Card>
  );
});
