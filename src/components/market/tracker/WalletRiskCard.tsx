"use client";

import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, KpiRibbon, TokenAvatar, type KpiCell } from "@/components/common";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { cn } from "@/lib/utils";

interface WalletRiskCardProps {
  address: string;
}

interface LadderRow {
  coin: string;
  long: boolean;
  leverage: number;
  notional: number;
  mark: number;
  liq: number;
  /** Fraction of the mark price the market must move against the position to hit liquidation. */
  distance: number;
}

/** Bars scale to this distance (moves past 50% read as "far"). */
const LADDER_SCALE = 0.5;
const usd = (v: number) => compactUsd(v, { fallback: "-" });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
/** Distances past 100% (shorts whose liquidation is a multiple of the price away) read as "far". */
const dist = (v: number) => (v >= 1 ? ">100%" : pct(v));
const px = (v: number) => v.toLocaleString("en-US", { maximumSignificantDigits: 6 });

/**
 * Live risk of a wallet's perp account, from Hyperliquid's clearinghouse
 * state: effective leverage, net exposure, maintenance margin, withdrawable,
 * and every open position ranked by how far price must move to liquidate it.
 * Hidden when the wallet has no open perp position.
 */
export function WalletRiskCard({ address }: WalletRiskCardProps) {
  const { perpPositions } = useWalletsBalances(address);

  const model = useMemo(() => {
    if (!perpPositions?.assetPositions?.length) return null;
    const equity = Number(perpPositions.marginSummary.accountValue);
    const crossEquity = Number(perpPositions.crossMarginSummary.accountValue);
    const maintenance = Number(perpPositions.crossMaintenanceMarginUsed);
    let longNtl = 0;
    let shortNtl = 0;
    let upnl = 0;
    const ladder: LadderRow[] = [];

    for (const { position: p } of perpPositions.assetPositions) {
      const szi = Number(p.szi);
      const notional = Math.abs(Number(p.positionValue));
      if (!szi || !notional) continue;
      const long = szi > 0;
      if (long) longNtl += notional;
      else shortNtl += notional;
      upnl += Number(p.unrealizedPnl) || 0;
      const mark = notional / Math.abs(szi);
      const liq = Number(p.liquidationPx);
      if (p.liquidationPx && liq > 0 && mark > 0) {
        const distance = long ? (mark - liq) / mark : (liq - mark) / mark;
        ladder.push({ coin: p.coin, long, leverage: p.leverage?.value ?? 0, notional, mark, liq, distance: Math.max(0, distance) });
      }
    }
    if (!longNtl && !shortNtl) return null;
    ladder.sort((a, b) => a.distance - b.distance);
    const gross = longNtl + shortNtl;
    return {
      equity,
      effLev: equity > 0 ? gross / equity : null,
      bias: (longNtl - shortNtl) / gross,
      longNtl,
      shortNtl,
      maintenanceRatio: crossEquity > 0 ? maintenance / crossEquity : null,
      withdrawable: Number(perpPositions.withdrawable),
      upnl,
      ladder,
      positions: perpPositions.assetPositions.length,
    };
  }, [perpPositions]);

  if (!model) return null;

  const biasLabel =
    Math.abs(model.bias) < 0.1 ? "Balanced" : model.bias > 0 ? `Net long ${pct(model.bias)}` : `Net short ${pct(-model.bias)}`;
  const closest = model.ladder[0];

  const cells: KpiCell[] = [
    {
      key: "lev",
      label: "Effective leverage",
      value: model.effLev != null ? `${model.effLev.toFixed(2)}x` : "-",
      sub: `${usd(model.longNtl + model.shortNtl)} notional`,
      tone: model.effLev != null && model.effLev >= 10 ? "danger" : "default",
    },
    {
      key: "bias",
      label: "Exposure",
      value: biasLabel,
      sub: `${usd(model.longNtl)} long · ${usd(model.shortNtl)} short`,
      tone: model.bias > 0.1 ? "success" : model.bias < -0.1 ? "danger" : "default",
    },
    {
      key: "mm",
      label: "Maintenance margin",
      value: model.maintenanceRatio != null ? pct(model.maintenanceRatio) : "-",
      sub: "of cross equity · liquidation at 100%",
      tone: model.maintenanceRatio != null && model.maintenanceRatio >= 0.5 ? "danger" : "default",
    },
    {
      key: "closest",
      label: "Closest liquidation",
      value: closest ? `${dist(closest.distance)} away` : "None",
      sub: closest ? `${closest.coin} ${closest.long ? "long" : "short"} · liq ${px(closest.liq)}` : "no liquidation price",
      tone: closest && closest.distance < 0.1 ? "danger" : "default",
    },
    {
      key: "upnl",
      label: "Unrealized PnL",
      value: `${model.upnl >= 0 ? "+" : "-"}${usd(Math.abs(model.upnl))}`,
      sub: `${usd(model.withdrawable)} withdrawable`,
      tone: model.upnl >= 0 ? "success" : "danger",
    },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeading
        title="Live risk"
        icon={<ShieldAlert className="h-4 w-4 text-brand" />}
        meta={`${model.positions} open position${model.positions === 1 ? "" : "s"}`}
      />
      <KpiRibbon cells={cells} />

      {model.ladder.length > 0 && (
        <div className="border-t border-border-subtle">
          <div className="flex items-baseline justify-between px-3.5 pt-3 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              Liquidation ladder
            </span>
            <span className="text-[10px] text-text-tertiary">move against the position to liquidate it</span>
          </div>
          <ul className="max-h-[280px] overflow-y-auto px-3.5 pb-3">
            {model.ladder.map((row) => (
              <li key={row.coin} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 py-1.5 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <TokenAvatar assetName={row.coin} size="xs" />
                  <span className="truncate font-medium text-text-primary">{row.coin}</span>
                  <span className={cn("text-[10px] font-semibold", row.long ? "text-success" : "text-danger")}>
                    {row.long ? "L" : "S"} {row.leverage}x
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" title={`liq ${px(row.liq)} · mark ${px(row.mark)}`}>
                  <div
                    className={cn(
                      "h-full rounded-full",
                      row.distance < 0.1 ? "bg-danger" : row.distance < 0.25 ? "bg-gold" : "bg-success"
                    )}
                    style={{ width: `${Math.max(2, Math.min(1, row.distance / LADDER_SCALE) * 100)}%` }}
                  />
                </div>
                <div className="w-28 text-right tabular-nums">
                  <span className="mono text-text-primary">{dist(row.distance)}</span>
                  <span className="ml-2 text-text-tertiary">{usd(row.notional)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
