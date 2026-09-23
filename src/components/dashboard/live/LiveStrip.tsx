"use client";

import { KpiRibbon, TokenAvatar, type KpiCell } from "@/components/common";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useRevenueBreakdown } from "@/services/market/revenue/hooks/useRevenueBreakdown";
import { useLiquidationsData } from "@/services/explorer/liquidation/hooks/useLiquidationsData";
import { compactCount, compactUsd, formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { ChainPulse } from "@/services/dashboard/live/useChainPulse";

const EMPTY = "—";

/**
 * The Overview's top bar: four streamed cells (HYPE, block height, block and
 * transaction rates) followed by the four network scalars.
 */
export function LiveStrip({ pulse }: { pulse: ChainPulse }) {
  const { format } = useNumberFormat();
  const { price: hype, lastSide } = useHypePrice();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perp } = usePerpGlobalStats();
  const { breakdown } = useRevenueBreakdown("7d");
  const { stats: liq } = useLiquidationsData("24h");

  const revenue24h = breakdown?.days?.length ? breakdown.days[breakdown.days.length - 1].total : undefined;
  const longPct = liq && liq.totalVolume > 0 ? Math.round((liq.longVolume / liq.totalVolume) * 100) : null;

  const cells: KpiCell[] = [
    {
      key: "hype",
      href: "/hype",
      label: <span className="inline-flex items-center gap-1.5"><TokenAvatar assetName="HYPE" size="xs" className="rounded-full" />HYPE</span>,
      value: hype ? formatPrice(hype, format) : "…",
      tone: lastSide === "B" ? "success" : lastSide === "A" ? "danger" : undefined,
      sub: "live, per trade",
    },
    {
      key: "block",
      href: pulse.height != null ? `/explorer/block/${pulse.height}` : "/explorer",
      label: "Block",
      // Ten digits: a notch smaller so the height fits the cell at every width.
      value: pulse.height != null ? <span className="text-[15px]">{formatNumber(pulse.height, format, { maximumFractionDigits: 0 })}</span> : "…",
      sub: "HyperCore height",
    },
    {
      key: "bps",
      href: "/explorer",
      label: "Blocks / s",
      value: pulse.blocksPerSec != null ? pulse.blocksPerSec.toFixed(1) : "…",
      sub: "60s average",
    },
    {
      key: "tps",
      href: "/explorer",
      label: "Tx / s",
      value: pulse.txPerSec != null ? compactCount(pulse.txPerSec) : "…",
      sub: "60s average",
    },
    { key: "vol", href: "/market", label: "24h Volume", value: statsLoading && !stats ? "…" : compactUsd(stats?.dailyVolume) },
    { key: "oi", href: "/market/perp", label: "Open Interest", value: compactUsd(perp?.totalOpenInterest) },
    { key: "rev", href: "/dashboard/capital", label: "Revenue 24h", value: revenue24h != null ? compactUsd(revenue24h) : EMPTY, tone: "gold" },
    {
      key: "liq",
      href: "/explorer/liquidations",
      label: "Liqs 24h",
      value: liq?.totalVolume ? compactUsd(liq.totalVolume) : EMPTY,
      sub:
        longPct != null ? (
          <span>
            <span className="text-success">L {longPct}%</span> · <span className="text-danger">S {100 - longPct}%</span>
            {liq?.topCoin ? (
              <span className="text-text-tertiary">
                {" · "}
                <span className="inline-flex items-center gap-1 align-middle"><TokenAvatar assetName={liq.topCoin} size="xs" />{liq.topCoin}</span>
              </span>
            ) : null}
          </span>
        ) : undefined,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" />;
}
