"use client";

import { memo, useMemo, type ReactNode } from "react";
import { useExplorerStore } from "@/services/explorer";
import {
  useActiveTraders24h,
  useTotalFills24h,
} from "@/services/indexer/overview";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useValidators } from "@/services/explorer/validator";
import { useBuildersGlobalStats } from "@/services/indexer/builders/hooks/useBuildersGlobalStats";
import { useHLBridge } from "@/services/dashboard/hooks/useHLBridge";
import {
  compactHype,
  compactUsd,
  formatNumber,
} from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * NetworkPulse — KPI ribbon for /explorer V4.2.
 *
 * Split in two clearly labelled sub-ribbons so HyperCore (L1) data never
 * mixes with cross-chain bridge data:
 *
 *  - **HyperCore (L1)** — 6 cells fed by the canonical chain:
 *      block height (WS), trades/sec, active addresses, HYPE staked,
 *      vaults TVL, builder fees. No EVM data here.
 *  - **Cross-Chain Capital** — 2 cells fed by the USDC bridge (DefiLlama):
 *      total USDC bridged + net inflow 24h.
 *
 * EVM-only metrics (blocks count, contract count, gas) live elsewhere if/when
 * we decide to surface them — they don't belong in the Core pulse.
 */

const PLACEHOLDER = "—";

function formatCount(n: number | null | undefined, format: string): string {
  if (n == null || !Number.isFinite(n)) return PLACEHOLDER;
  return formatNumber(n, format as "US" | "EU" | "FR" | "PLAIN", {
    maximumFractionDigits: 0,
  });
}

/** Net inflow + latest TVL across every DefiLlama chainTvls (Arbitrum + L1).
 *  Net = sum of (latest - previous) deltas per chain. */
function computeBridgeNet24h(
  chainTvls:
    | Record<string, { tvl: { date: number; totalLiquidityUSD: number }[] }>
    | undefined,
): { net: number; latest: number } | null {
  if (!chainTvls) return null;
  let net = 0;
  let latest = 0;
  let touched = false;
  for (const chain of Object.values(chainTvls)) {
    const series = chain?.tvl;
    if (!series || series.length === 0) continue;
    const sorted = [...series].sort((a, b) => a.date - b.date);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    latest += last.totalLiquidityUSD;
    if (prev) net += last.totalLiquidityUSD - prev.totalLiquidityUSD;
    touched = true;
  }
  return touched ? { net, latest } : null;
}

function SubRibbonLabel({
  label,
  helper,
}: {
  label: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 px-3.5 py-2 bg-surface-2 border-b border-border-subtle">
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-semibold">
        {label}
      </span>
      {helper && (
        <span className="text-[10px] text-text-tertiary">{helper}</span>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
  valueClass,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-surface hover:bg-surface-2 transition-colors px-4 py-3 flex flex-col">
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        {label}
      </div>
      <div
        className={`mono text-[20px] font-semibold tracking-[-0.02em] mt-1 leading-none ${
          valueClass ?? "text-text-primary"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="mono text-[10px] text-text-tertiary mt-1.5">{sub}</div>
      )}
    </div>
  );
}

export const NetworkPulse = memo(function NetworkPulse() {
  const { format } = useNumberFormat();

  // currentBlockHeight comes from the canonical L1 websocket connected by
  // `LiveActivity` (mounted on the same page); we just consume the value.
  const currentBlockHeight = useExplorerStore((s) => s.currentBlockHeight);
  const { data: fills } = useTotalFills24h();
  const { data: traders } = useActiveTraders24h();
  const { vaults, totalTvl: vaultsTvl } = useVaults({
    limit: 1000,
    sortBy: "tvl",
  });
  const { stats: validatorStats } = useValidators();
  const { stats: builderStats } = useBuildersGlobalStats("24h");
  const { bridgeData } = useHLBridge();

  // Trades / sec averaged over the last 24h. `/indexer/overview/total-fills-24h`
  // is the canonical CLOB fill counter (perp + spot + HIP-3) — a Core metric,
  // unrelated to EVM transactions.
  const txPerSec = useMemo(() => {
    if (!fills?.value || !Number.isFinite(fills.value)) return null;
    return fills.value / 86_400;
  }, [fills?.value]);

  const bridge = useMemo(
    () => computeBridgeNet24h(bridgeData?.chainTvls),
    [bridgeData],
  );

  const activeVaults = vaults?.length ?? 0;
  const builderFees24h = builderStats?.current?.totalBuilderFees ?? null;
  const uniqueBuilders = builderStats?.current?.uniqueBuilders ?? null;
  const bridgeNetPositive = bridge ? bridge.net >= 0 : true;

  return (
    <div className="space-y-3">
      {/* === HyperCore (L1) sub-ribbon === */}
      <div className="border border-border-default rounded-lg overflow-hidden">
        <SubRibbonLabel
          label="HyperCore · L1"
          helper="Canonical orderbook chain — trades, validators, vaults, builders"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-border-subtle">
          <Cell
            label="Block height"
            value={
              currentBlockHeight > 0
                ? currentBlockHeight.toLocaleString()
                : PLACEHOLDER
            }
            sub={
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                live
              </span>
            }
          />
          <Cell
            label="Trades / sec · 24h"
            value={txPerSec != null ? txPerSec.toFixed(1) : PLACEHOLDER}
            sub={fills?.value ? `${compactHype(fills.value)} fills · 24h` : "—"}
          />
          <Cell
            label="Active addr · 24h"
            value={
              traders?.value != null
                ? formatCount(traders.value, format)
                : PLACEHOLDER
            }
            sub={
              traders?.variationPct != null ? (
                <span
                  className={
                    traders.variationPct >= 0 ? "text-success" : "text-danger"
                  }
                >
                  {traders.variationPct >= 0 ? "+" : ""}
                  {traders.variationPct.toFixed(1)}% vs prior 24h
                </span>
              ) : (
                "unique signers"
              )
            }
          />
          <Cell
            label="HYPE staked"
            value={compactHype(validatorStats?.totalHypeStaked)}
            sub={
              validatorStats?.active
                ? `${validatorStats.active} validators`
                : "—"
            }
            valueClass="text-gold"
          />
          <Cell
            label="Vaults TVL"
            value={compactUsd(vaultsTvl)}
            sub={activeVaults > 0 ? `${activeVaults} active vaults` : "—"}
          />
          <Cell
            label="Builder fees · 24h"
            value={compactUsd(builderFees24h)}
            sub={
              uniqueBuilders != null
                ? `${uniqueBuilders} active builders`
                : "—"
            }
            valueClass="text-gold"
          />
        </div>
      </div>

      {/* === Cross-Chain Capital sub-ribbon === */}
      <div className="border border-border-default rounded-lg overflow-hidden">
        <SubRibbonLabel
          label="Cross-Chain Capital"
          helper="USDC bridge (Arbitrum ↔ Hyperliquid L1) — DefiLlama feed"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle">
          <Cell
            label="Total USDC bridged"
            value={compactUsd(bridge?.latest ?? null)}
            sub="Arbitrum + L1 chainTvls"
          />
          <Cell
            label="Bridge net · 24h"
            value={
              bridge
                ? `${bridgeNetPositive ? "+" : ""}${compactUsd(bridge.net)}`
                : PLACEHOLDER
            }
            sub={bridge ? `total ${compactUsd(bridge.latest)}` : "—"}
            valueClass={bridgeNetPositive ? "text-success" : "text-danger"}
          />
        </div>
      </div>
    </div>
  );
});
