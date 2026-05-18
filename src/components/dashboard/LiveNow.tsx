"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Gavel, Activity, Flame, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuctions } from "@/services/market/auction";
import { useTwapOrders } from "@/services/market/order";
import { useLiquidations24h } from "@/services/dashboard/hooks/useLiquidations24h";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * LiveNow — résumé curé de l'activité live de l'écosystème.
 *
 * Pas trois tableaux : trois lignes, un chiffre chacune (auctions 24h,
 * TWAPs actifs, liquidations 24h). Le détail vit sur les pages dédiées.
 */

const DAY_MS = 86_400_000;

function LiveRow({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mono text-[16px] font-semibold text-text-primary leading-tight">{value}</div>
        <div className="text-[11px] text-text-tertiary">{label}</div>
      </div>
      <ArrowUpRight
        size={14}
        className="text-text-tertiary group-hover:text-brand transition-colors shrink-0"
      />
    </Link>
  );
}

export const LiveNow = memo(function LiveNow() {
  const { auctions } = useAuctions({ currency: "ALL", limit: 50 });
  const { metadata, total } = useTwapOrders({ limit: 100, status: "active" });
  const { stats: liq } = useLiquidations24h(30000);

  const auctions24h = useMemo(() => {
    const now = Date.now();
    return auctions.filter((a) => now - a.time < DAY_MS).length;
  }, [auctions]);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-primary">Live Now</h3>
      </div>
      <div className="flex flex-col py-1">
        <LiveRow
          icon={Gavel}
          value={`${auctions24h}`}
          label="token auctions in the last 24h"
          href="/market/spot/auction"
        />
        <LiveRow
          icon={Activity}
          value={`${metadata?.activeOrders ?? total}`}
          label="active TWAP orders"
          href="/market/perp"
        />
        <LiveRow
          icon={Flame}
          value={compactUsd(liq.totalVolume)}
          label="liquidated in the last 24h"
          href="/explorer/liquidations"
        />
      </div>
    </Card>
  );
});
