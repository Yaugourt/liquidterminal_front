"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, DataStatus, TokenAvatar } from "@/components/common";
import { compactUsd, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { LivePrint } from "@/services/dashboard/live/useLiveMarketFeed";

const THRESHOLDS = [10_000, 25_000, 100_000] as const;
const DEFAULT_THRESHOLD = 25_000;
const MAX_ROWS = 14;

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

/**
 * Big prints: trades at or above a notional threshold on the most traded
 * perps. Opens on the last five minutes from the indexed fills, then the
 * public trades channel streams new ones in. The flow bar splits those five
 * minutes by aggressor side. Every row leads somewhere: the market, the
 * taker's wallet, the L1 transaction.
 */
export const BigPrintsCard = memo(function BigPrintsCard({
  prints,
  connected,
  seeded,
  coinCount,
}: {
  prints: LivePrint[];
  connected: boolean;
  seeded: boolean;
  coinCount: number;
}) {
  const { format } = useNumberFormat();
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

  const { rows, buys, sells, count } = useMemo(() => {
    const kept = prints.filter((p) => p.ntl >= threshold);
    let b = 0;
    let s = 0;
    for (const p of kept) {
      if (p.side === "B") b += p.ntl;
      else s += p.ntl;
    }
    return { rows: kept.slice(0, MAX_ROWS), buys: b, sells: s, count: kept.length };
  }, [prints, threshold]);

  const total = buys + sells;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<Waves size={13} className="text-brand" />}
        title="Big prints"
        meta={coinCount ? `top ${coinCount} perps` : undefined}
        status={<DataStatus variant="live" connected={connected} />}
        href="/market/trades"
        viewAllLabel="Trade explorer"
        actions={
          <div className="flex gap-1" role="group" aria-label="Minimum trade size">
            {THRESHOLDS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThreshold(t)}
                aria-pressed={threshold === t}
                className={`mono text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  threshold === t
                    ? "text-brand border-brand/30 bg-brand/10"
                    : "text-text-tertiary border-border-subtle hover:text-text-secondary"
                }`}
              >
                {compactUsd(t, { decimals: 0 })}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-3.5 pt-2.5 pb-2 space-y-1">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
          Aggressor flow · last 5 min
        </div>
        <div className="h-1.5 rounded-full overflow-hidden flex bg-surface-2">
          {total > 0 && (
            <>
              <span className="bg-success" style={{ width: `${(buys / total) * 100}%` }} />
              <span className="bg-danger" style={{ width: `${(sells / total) * 100}%` }} />
            </>
          )}
        </div>
        <div className="mono text-[11px] text-text-secondary">
          <span className="text-success">Buys {compactUsd(buys)}</span> ·{" "}
          <span className="text-danger">Sells {compactUsd(sells)}</span> ·{" "}
          <span className="text-text-tertiary">{seeded ? `${count} prints` : "loading the last 5 min…"}</span>
        </div>
      </div>

      <div className="h-[300px] overflow-y-auto scrollbar-brand pl-3.5 pr-2 pb-2">
        {rows.length === 0 ? (
          <div className="h-full grid place-items-center text-[12px] text-text-tertiary text-center px-4">
            {!seeded ? "Loading the last five minutes…" : connected ? `Waiting for a print of ${compactUsd(threshold, { decimals: 0 })} or more…` : "Connecting to the trade stream…"}
          </div>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {rows.map((p) => (
                <tr key={p.tid} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {p.hash ? (
                      <Link href={`/explorer/transaction/${p.hash}`} className="text-text-tertiary hover:text-brand" title="Open the transaction">
                        {clock(p.time)}
                      </Link>
                    ) : (
                      <span className="text-text-tertiary">{clock(p.time)}</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <Link href={`/market/perp/${encodeURIComponent(p.coin)}`} className="inline-flex items-center gap-1.5 text-text-primary hover:text-brand">
                      <TokenAvatar assetName={p.coin} size="xs" />
                      {p.coin}
                    </Link>
                  </td>
                  <td className={`py-1.5 pr-2 font-semibold ${p.side === "B" ? "text-success" : "text-danger"}`}>
                    {p.side === "B" ? "BUY" : "SELL"}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-text-primary whitespace-nowrap">{compactUsd(p.ntl)}</td>
                  <td className="py-1.5 pr-2 text-right text-text-tertiary whitespace-nowrap">{formatPrice(p.px, format, { showCurrency: false })}</td>
                  <td className="py-1.5 text-right whitespace-nowrap hidden sm:table-cell">
                    {p.taker ? (
                      <Link href={`/market/tracker/wallet/${p.taker}`} className="text-text-secondary hover:text-brand" title="Taker wallet">
                        {short(p.taker)}
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});
