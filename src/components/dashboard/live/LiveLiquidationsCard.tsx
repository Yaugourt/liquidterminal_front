"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardHead, DataStatus, ModuleTable, ModuleTableRow, SideBadge, TokenAvatar, type ModuleColumn } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useLiveLiquidations } from "@/services/dashboard/live/useLiveLiquidations";

// The wallet column shows while the card spans the row (sm to xl); from 2xl the
// card is a third of the row and the market name needs the room.
const COLUMNS: ModuleColumn[] = [
  { header: "Age", width: 48, align: "left" },
  { header: "Market", align: "left" },
  { header: "Side", width: 76, align: "left" },
  // 84px: a 60px content box holds "$123.45M" (8 mono chars); 68px clipped "$123.4K".
  { header: "Size", width: 84 },
  { header: "Wallet", width: 104, className: "hidden sm:table-cell 2xl:hidden" },
];

function age(ms: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Liquidations streamed from the backend push, newest first. The age opens
 * the transaction, the coin its market, the address the liquidated wallet.
 */
export const LiveLiquidationsCard = memo(function LiveLiquidationsCard() {
  const { rows, connected } = useLiveLiquidations(12);
  const [now, setNow] = useState(() => Date.now());

  // Ages tick on their own; the list itself only changes on a push.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Liquidations"
        actions={<DataStatus variant="live" connected={connected} />}
        href="/explorer/liquidations"
        viewAllLabel="All"
      />
      <div className="h-[364px] overflow-y-auto scrollbar-brand">
        {rows.length === 0 ? (
          <div className="h-full grid place-items-center text-[12px] text-text-tertiary">Loading liquidations…</div>
        ) : (
          <ModuleTable columns={COLUMNS} density="compact">
            {rows.map((l) => (
              <ModuleTableRow
                key={l.tid}
                cells={[
                  <Link key="t" href={`/explorer/transaction/${l.hash}`} prefetch={false} className="mono text-[11px] text-text-tertiary hover:text-brand whitespace-nowrap" title="Open the transaction">
                    {age(l.time_ms, now)}
                  </Link>,
                  <Link key="m" href={`/market/perp/${encodeURIComponent(l.coin)}`} prefetch={false} className="flex min-w-0 items-center gap-1.5 text-text-primary hover:text-brand">
                    <TokenAvatar assetName={l.coin} size="xs" />
                    <span className="truncate">{l.coin}</span>
                  </Link>,
                  <SideBadge key="s" side={l.liq_dir === "Long" ? "long" : "short"} />,
                  <span key="n" className="mono text-[12px] text-text-primary whitespace-nowrap">{compactUsd(l.notional_total)}</span>,
                  <Link key="u" href={`/market/tracker/wallet/${l.liquidated_user}`} prefetch={false} className="mono text-[11px] text-text-tertiary hover:text-brand whitespace-nowrap" title="Liquidated wallet">
                    {short(l.liquidated_user)}
                  </Link>,
                ]}
              />
            ))}
          </ModuleTable>
        )}
      </div>
    </Card>
  );
});
