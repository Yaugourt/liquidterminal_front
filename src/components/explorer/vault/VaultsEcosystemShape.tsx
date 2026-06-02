"use client";

import { useMemo } from "react";
import {
  OverviewModule,
  FlowGrid,
  FlowBar,
  AuroraAreaChart,
  chartColors,
  chartPalette,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";
/** Same "active" floor as the headline KPI — dust vaults distort the spread. */
const ACTIVE_TVL_FLOOR = 10_000;

/** APR buckets for the spread histogram. Colors come from chartTheme (no hex). */
const APR_BUCKETS: { label: string; color: string; lo: number; hi: number }[] = [
  { label: "<0", color: chartPalette.danger, lo: -Infinity, hi: 0 },
  { label: "0–10", color: chartColors.textMuted, lo: 0, hi: 10 },
  { label: "10–50", color: chartPalette.accent, lo: 10, hi: 50 },
  { label: "50–100", color: chartPalette.accent, lo: 50, hi: 100 },
  { label: "100–300", color: chartPalette.gold, lo: 100, hi: 300 },
  { label: ">300", color: chartPalette.gold, lo: 300, hi: Infinity },
];

const fmtMonth = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

interface VaultsEcosystemShapeProps {
  directory: UseVaultsDirectoryResult;
}

/**
 * "Ecosystem shape" band for /explorer/vaults — three snapshot charts derived
 * entirely from the live directory (no history endpoint exists, GATE-1 honest):
 *  - Vault growth  : cumulative vault count over time (from createTimeMillis).
 *  - Capital map   : top-5 vaults by TVL excl HLP, with HLP shown as a summary.
 *  - APR spread    : APR distribution of the active set (TVL above the floor).
 * Built on the DS chart primitives (AuroraArea / FlowGrid+FlowBar / AuroraHistogram)
 * wrapped in the same minimal OverviewModule card as the leaderboards.
 */
export function VaultsEcosystemShape({ directory }: VaultsEcosystemShapeProps) {
  const { rows, totalCount } = directory;

  // 1 · Cumulative vault count, bucketed by month.
  const growth = useMemo(() => {
    const times = rows
      .map((r) => r.summary.createTimeMillis)
      .filter((t) => Number.isFinite(t) && t > 0)
      .sort((a, b) => a - b);
    if (times.length === 0) return [] as { time: number; value: number }[];
    const byMonth = new Map<number, number>();
    for (const t of times) {
      const d = new Date(t);
      const key = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    let cum = 0;
    return [...byMonth.keys()]
      .sort((a, b) => a - b)
      .map((m) => {
        cum += byMonth.get(m) ?? 0;
        return { time: m, value: cum };
      });
  }, [rows]);

  // 2 · TVL concentration — HLP summary + top-5 non-HLP bars.
  const capital = useMemo(() => {
    const withTvl = rows
      .map((r) => ({ r, tvl: parseFloat(r.summary.tvl) }))
      .filter((x) => Number.isFinite(x.tvl) && x.tvl > 0);
    const total = withTvl.reduce((a, x) => a + x.tvl, 0);
    const hlp = withTvl.find(
      (x) => x.r.summary.vaultAddress.toLowerCase() === HLP_ADDRESS
    );
    const nonHlp = withTvl
      .filter((x) => x.r.summary.vaultAddress.toLowerCase() !== HLP_ADDRESS)
      .sort((a, b) => b.tvl - a.tvl);
    const top = nonHlp.slice(0, 5);
    return {
      hlpTvl: hlp?.tvl ?? 0,
      hlpShare: total ? ((hlp?.tvl ?? 0) / total) * 100 : 0,
      top,
      max: top.length ? top[0].tvl : 1,
      nonHlpTotal: nonHlp.reduce((a, x) => a + x.tvl, 0),
    };
  }, [rows]);

  // 3 · APR distribution over the active set.
  const aprSpread = useMemo(() => {
    const active = rows.filter(
      (r) =>
        !r.summary.isClosed &&
        r.summary.vaultAddress.toLowerCase() !== HLP_ADDRESS &&
        Number.isFinite(r.apr) &&
        parseFloat(r.summary.tvl) >= ACTIVE_TVL_FLOOR
    );
    const buckets = APR_BUCKETS.map((b) => ({
      label: b.label,
      color: b.color,
      count: active.filter((r) => r.apr >= b.lo && r.apr < b.hi).length,
    }));
    return {
      buckets,
      max: Math.max(1, ...buckets.map((b) => b.count)),
      negative: buckets[0]?.count ?? 0,
      n: active.length,
    };
  }, [rows]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {/* Vault growth */}
      <OverviewModule title="Vault growth" tag="cumulative" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
          <AuroraAreaChart
            data={growth}
            height={150}
            showGrid={false}
            yAxisWidth={34}
            formatValue={(v) => compactCount(v)}
            formatTime={fmtMonth}
          />
          <div className="text-[10.5px] text-text-tertiary mt-auto">
            <span className="mono text-text-secondary">{compactCount(totalCount)}</span>{" "}
            vaults tracked · cumulative since launch
          </div>
        </div>
      </OverviewModule>

      {/* Capital map */}
      <OverviewModule title="Capital map" tag="excl HLP" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col gap-2.5 flex-1">
          <div className="flex items-baseline gap-2 pb-2.5 border-b border-border-subtle">
            <span className="text-[11px] text-text-tertiary">HLP</span>
            <span className="mono text-[12px] text-text-secondary ml-auto">
              {compactUsd(capital.hlpTvl)} · {capital.hlpShare.toFixed(0)}%
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <FlowGrid
              rows={capital.top}
              rowKey={(x) => x.r.summary.vaultAddress}
              showHeaders={false}
              columns={[
                {
                  header: "",
                  width: "1fr",
                  align: "left",
                  render: (x) => (
                    <span className="block truncate text-[11px] text-text-secondary">
                      {x.r.summary.name}
                    </span>
                  ),
                },
                {
                  header: "",
                  width: "110px",
                  render: (x, i) => (
                    <FlowBar
                      ratio={capital.max ? x.tvl / capital.max : 0}
                      height={6}
                      delay={i * 0.03}
                      minVisiblePct={6}
                    />
                  ),
                },
                {
                  header: "",
                  width: "56px",
                  align: "right",
                  render: (x) => (
                    <span className="mono text-[11px] text-text-tertiary">
                      {compactUsd(x.tvl)}
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <div className="text-[10.5px] text-text-tertiary mt-auto pt-1">
            share of the{" "}
            <span className="mono text-text-secondary">
              {compactUsd(capital.nonHlpTotal)}
            </span>{" "}
            non-HLP TVL
          </div>
        </div>
      </OverviewModule>

      {/* APR spread — categorical bars (count on top, all 6 buckets labelled). */}
      <OverviewModule title="APR spread" tag="active" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
          <div>
            <div className="flex gap-2 items-end h-[150px]">
              {aprSpread.buckets.map((b) => (
                <div
                  key={b.label}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-1"
                >
                  <span className="mono text-[9px] text-text-tertiary leading-none">
                    {b.count}
                  </span>
                  <div
                    className="w-full rounded-t-[2px]"
                    style={{
                      // Cap at 88% so the tallest bar keeps headroom for its
                      // count label instead of overflowing into the card head.
                      height: `${(b.count / aprSpread.max) * 88}%`,
                      background: b.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {aprSpread.buckets.map((b) => (
                <span
                  key={b.label}
                  className="flex-1 min-w-0 truncate text-center mono text-[9px] text-text-tertiary"
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[10.5px] text-text-tertiary mt-auto">
            <span className="mono text-danger">{aprSpread.negative}</span> negative ·
            long high-APR tail ·{" "}
            <span className="mono text-text-secondary">n={aprSpread.n}</span>
          </div>
        </div>
      </OverviewModule>
    </div>
  );
}
