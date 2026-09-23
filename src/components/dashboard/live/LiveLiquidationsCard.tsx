"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, DataStatus } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useLiveLiquidations } from "@/services/dashboard/live/useLiveLiquidations";

function age(ms: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

/** Liquidations streamed from the backend push, newest first. */
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
      <CardHeading
        icon={<Zap size={13} className="text-brand" />}
        title="Liquidations"
        status={<DataStatus variant="live" connected={connected} />}
        href="/explorer/liquidations"
        viewAllLabel="All"
      />
      <div className="h-[364px] overflow-y-auto px-3.5 py-1">
        {rows.length === 0 ? (
          <div className="h-full grid place-items-center text-[12px] text-text-tertiary">Loading liquidations…</div>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {rows.map((l) => (
                <tr key={l.tid} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 text-text-tertiary whitespace-nowrap">{age(l.time_ms, now)}</td>
                  <td className="py-1.5 pr-2 whitespace-nowrap max-w-[96px] truncate">
                    <Link href={`/market/perp/${encodeURIComponent(l.coin)}`} className="text-text-primary hover:text-brand">
                      {l.coin}
                    </Link>
                  </td>
                  <td className={`py-1.5 pr-2 ${l.liq_dir === "Long" ? "text-success" : "text-danger"}`}>{l.liq_dir}</td>
                  <td className="py-1.5 text-right text-text-primary whitespace-nowrap">{compactUsd(l.notional_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});
