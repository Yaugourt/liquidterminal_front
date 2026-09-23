"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardHead, DataStatus, TokenAvatar } from "@/components/common";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { PerpMarketData } from "@/services/market/perp/types";

const FLASH_MS = 900;

/**
 * The most traded perps with a live mid. The 24h change is re-derived from the
 * live mid against the prior-day price implied by the last REST snapshot
 * (price / (1 + change24h)), so it moves with the tape between refreshes.
 */
export const PriceBoard = memo(function PriceBoard({
  markets,
  mids,
  connected,
}: {
  markets: PerpMarketData[];
  mids: Record<string, number>;
  connected: boolean;
}) {
  const { format } = useNumberFormat();
  const prevRef = useRef<Record<string, number>>({});
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    const next: Record<string, "up" | "down"> = {};
    for (const [coin, mid] of Object.entries(mids)) {
      const prev = prevRef.current[coin];
      if (prev != null && mid !== prev) next[coin] = mid > prev ? "up" : "down";
    }
    prevRef.current = { ...mids };
    if (Object.keys(next).length === 0) return;
    setFlash(next);
    const id = setTimeout(() => setFlash({}), FLASH_MS);
    return () => clearTimeout(id);
  }, [mids]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Price board"
        tag="most traded perps"
        actions={<DataStatus variant="live" connected={connected} />}
        href="/market/perp"
        viewAllLabel="All perps"
      />
      <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {markets.length === 0
          ? Array.from({ length: 16 }).map((_, i) => <div key={i} className="h-[58px] rounded-md bg-surface-2/60 animate-pulse" />)
          : markets.map((m) => {
              const mid = mids[m.name] ?? m.price;
              const prevDay = m.change24h > -100 ? m.price / (1 + m.change24h / 100) : 0;
              const change = prevDay > 0 ? (mid / prevDay - 1) * 100 : m.change24h;
              const f = flash[m.name];
              return (
                <Link
                  key={m.name}
                  href={`/market/perp/${encodeURIComponent(m.name)}`}
                  className={`rounded-md bg-surface-2/60 px-2.5 py-2 border transition-colors duration-300 hover:bg-surface-2 ${
                    f === "up" ? "border-success/60" : f === "down" ? "border-danger/60" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TokenAvatar assetName={m.name} src={m.logo} size="xs" />
                    <span className="text-[11px] font-semibold text-text-secondary truncate">{m.name}</span>
                  </div>
                  <div className="mono text-[13px] text-text-primary">{formatPrice(mid, format, { showCurrency: false })}</div>
                  <div className={`mono text-[10px] ${change >= 0 ? "text-success" : "text-danger"}`}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </div>
                </Link>
              );
            })}
      </div>
    </Card>
  );
});
