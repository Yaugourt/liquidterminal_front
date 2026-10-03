"use client";

import { memo } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, DataStatus, KpiRibbon, TokenAvatar, type KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { LiveTwap, TwapBoard } from "@/services/dashboard/live/useTwapBoard";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** "2h 14m" / "38m" left. */
export function timeLeft(end: number, now = Date.now()): string {
  const m = Math.max(0, Math.round((end - now) / 60_000));
  if (m >= 60 * 24) return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m`;
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

export function TwapRow({ t }: { t: LiveTwap }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-1.5 border-t border-border-subtle first:border-t-0">
      <div className="min-w-0 flex items-center gap-1.5 text-[12px]">
        <Link href={`/market/${t.market === "spot" ? "spot" : "perp"}/${encodeURIComponent(t.coin)}`} className="inline-flex items-center gap-1.5 text-text-primary hover:text-brand font-medium">
          <TokenAvatar assetName={t.coin} size="xs" />
          {t.coin}
        </Link>
        <span className={`mono text-[10.5px] font-semibold ${t.isBuy ? "text-success" : "text-danger"}`}>{t.isBuy ? "BUY" : "SELL"}</span>
        <span className="mono text-[10px] text-text-tertiary uppercase">{t.market}</span>
        <Link href={`/market/tracker/wallet/${t.user}`} className="mono text-[11px] text-text-tertiary hover:text-brand truncate hidden sm:inline">
          {short(t.user)}
        </Link>
      </div>
      <div className="mono text-[12px] text-right text-text-primary whitespace-nowrap">
        {compactUsd(t.totalUsd)} <span className="text-text-tertiary">· {timeLeft(t.endTime)} left</span>
      </div>
      <div className="col-span-2 mt-1 h-1 rounded-full bg-surface-2 overflow-hidden">
        <span className={`block h-full ${t.isBuy ? "bg-success/70" : "bg-danger/70"}`} style={{ width: `${t.doneFraction * 100}%` }} />
      </div>
    </div>
  );
}

/**
 * TWAP flow: the sliced orders running on Hyperliquid right now. What is
 * left to buy and to sell (estimated from elapsed time), the coins with the
 * most TWAP flow, and the biggest TWAPs in progress.
 */
export const TwapFlowCard = memo(function TwapFlowCard({ board, isLoading }: { board: TwapBoard; isLoading: boolean }) {
  const { totals, started24h, byCoin, active, executed24hUsd } = board;
  const cells: KpiCell[] = [
    { key: "active", label: "Running now", value: isLoading && !active.length ? "…" : String(totals.count), sub: `${started24h.count} started in 24h` },
    { key: "done", label: "Executed, 24h", value: executed24hUsd > 0 ? compactUsd(executed24hUsd) : "—", sub: "TWAPs that ended" },
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
      <CardHeading
        icon={<Timer size={13} className="text-brand" />}
        title="TWAP flow"
        meta="running now"
        status={<DataStatus variant="polled" updatedAt={board.updatedAt} />}
        href="/dashboard/market"
        viewAllLabel="All TWAPs"
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
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">Biggest running · bar = time elapsed</div>
          <div className="h-[196px] overflow-y-auto scrollbar-brand pr-1">
            {active.slice(0, 12).map((t) => (
              <TwapRow key={t.hash} t={t} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        Executed amounts are real for TWAPs that ended. Left to execute is estimated from the time elapsed (one slice every 30s), at the current price. Source: our indexer, every TWAP of the last 24h plus those still running.
      </div>
    </Card>
  );
});
