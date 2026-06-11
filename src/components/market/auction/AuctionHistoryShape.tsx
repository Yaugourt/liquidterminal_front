"use client";

import { useMemo, useState } from "react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  AuroraHistogramChart,
  chartPalette,
} from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd, compactHype, compactCount } from "@/lib/formatters/numberFormatting";
import type { AuctionInfo } from "@/services/market/auction/types";
import type { UseAuctionHistoryResult } from "@/services/market/auction/hooks/useAuctionHistory";

type Era = "hype" | "usdc";
type Period = "90d" | "1y" | "all";

const DAY_MS = 86_400_000;
const PERIOD_MS: Record<Exclude<Period, "all">, number> = {
  "90d": 90 * DAY_MS,
  "1y": 365 * DAY_MS,
};

const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtMonth = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
const fmtMonthYear = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: "numeric" });

interface AuctionHistoryShapeProps {
  history: UseAuctionHistoryResult;
}

/**
 * "Gas history" band for /market/spot/auction — every winning bid as one bar
 * (auctions are discrete events: a histogram is honest where an area chart
 * would interpolate), the most expensive tickers of the selected era, and the
 * monthly deploy cadence across both eras (counts are currency-agnostic).
 */
export function AuctionHistoryShape({ history }: AuctionHistoryShapeProps) {
  const [era, setEra] = useState<Era>("hype");
  const [period, setPeriod] = useState<Period>("all");

  const eraAuctions = era === "hype" ? history.hypeAuctions : history.usdcAuctions;
  const fmtGas = (v: number) =>
    era === "hype" ? `${compactHype(v)} HYPE` : compactUsd(v);

  // Window anchored on the era's latest auction — the USDC era ended in
  // May 2025, an anchor on "today" would render it empty.
  const bids = useMemo(() => {
    if (!eraAuctions.length) return [];
    const latest = eraAuctions[0].time;
    const cutoff = period === "all" ? 0 : latest - PERIOD_MS[period];
    return eraAuctions
      .filter((a) => a.time >= cutoff && parseFloat(a.deployGas) > 0)
      .map((a) => ({ time: a.time, value: parseFloat(a.deployGas) }))
      .reverse();
  }, [eraAuctions, period]);

  const bidStats = useMemo(() => {
    if (!bids.length) return null;
    const values = bids.map((b) => b.value);
    const sum = values.reduce((a, v) => a + v, 0);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return { count: bids.length, sum, avg: sum / bids.length, median };
  }, [bids]);

  const topTickers = useMemo(
    () =>
      [...eraAuctions]
        .sort((a, b) => parseFloat(b.deployGas) - parseFloat(a.deployGas))
        .slice(0, 6),
    [eraAuctions]
  );

  // Deploys per month, both eras — UTC month buckets.
  const cadence = useMemo(() => {
    const buckets = new Map<number, number>();
    for (const a of history.all) {
      const d = new Date(a.time);
      const key = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([time, value]) => ({ time, value }));
  }, [history.all]);

  const cadencePeak = useMemo(
    () =>
      cadence.length
        ? cadence.reduce((m, p) => (p.value > m.value ? p : m), cadence[0])
        : null,
    [cadence]
  );

  return (
    <div className="space-y-4">
      {/* Row 1 — winning bids histogram + most expensive tickers (era-synced) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-stretch">
        <OverviewModule
          title="Winning bids"
          tag={era === "hype" ? "HYPE era" : "USDC era"}
          tagVariant="plain"
          className="min-w-0"
        >
          <div className="px-4 pt-3 flex items-center justify-between gap-2 flex-wrap">
            <PillTabs
              variant="text"
              tabs={[
                { value: "hype", label: "HYPE era" },
                { value: "usdc", label: "USDC era" },
              ]}
              activeTab={era}
              onTabChange={(v) => setEra(v as Era)}
            />
            <PillTabs
              variant="text"
              tabs={[
                { value: "90d", label: "90d" },
                { value: "1y", label: "1y" },
                { value: "all", label: "all" },
              ]}
              activeTab={period}
              onTabChange={(v) => setPeriod(v as Period)}
            />
          </div>
          <div className="px-4 pb-3.5 pt-2 flex-1 flex flex-col gap-3">
            {bids.length >= 2 ? (
              <div className="h-[230px]">
                <AuroraHistogramChart
                  data={bids}
                  defaultColor={chartPalette.gold}
                  formatValue={fmtGas}
                  formatTime={fmtDay}
                />
              </div>
            ) : (
              <div className="h-[230px] grid place-items-center text-xs text-text-tertiary">
                {history.isLoading ? "Loading…" : "No auctions in this window"}
              </div>
            )}
            <div className="text-[10.5px] text-text-tertiary mt-auto">
              {bidStats && (
                <>
                  <span className="mono text-text-secondary">
                    {compactCount(bidStats.count)}
                  </span>{" "}
                  deploys · Σ{" "}
                  <span className="mono text-gold">{fmtGas(bidStats.sum)}</span> · avg{" "}
                  <span className="mono text-text-secondary">{fmtGas(bidStats.avg)}</span>{" "}
                  · median{" "}
                  <span className="mono text-text-secondary">
                    {fmtGas(bidStats.median)}
                  </span>
                </>
              )}
            </div>
          </div>
        </OverviewModule>

        <OverviewModule
          title="Most expensive"
          tag={era === "hype" ? "HYPE era" : "USDC era"}
          tagVariant="plain"
        >
          <ModuleTable
            columns={[
              { header: "Token" },
              { header: "Gas", width: 96 },
              { header: "When", width: 64 },
            ]}
          >
            {topTickers.map((a: AuctionInfo) => (
              <ModuleTableRow
                key={`${a.tokenId}-${a.time}`}
                href={`/market/spot/${encodeURIComponent(a.name)}`}
                cells={[
                  <ModuleAsset
                    key="t"
                    tone="neutral"
                    assetName={a.name}
                    kind="spot"
                    name={a.name}
                    sub={`${a.deployer.slice(0, 6)}…${a.deployer.slice(-4)}`}
                  />,
                  <span key="g" className="mono font-medium text-gold">
                    {fmtGas(parseFloat(a.deployGas))}
                  </span>,
                  <span key="w" className="mono text-[11px] text-text-tertiary">
                    {fmtMonth(a.time)}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
          {topTickers.length === 0 && !history.isLoading && (
            <div className="px-4 py-3 text-[11px] text-text-tertiary">
              No auctions in this era yet.
            </div>
          )}
        </OverviewModule>
      </div>

      {/* Row 2 — monthly deploy cadence, both eras */}
      <OverviewModule title="Deploy cadence" tag="monthly · both eras" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
          {cadence.length >= 2 ? (
            <div className="h-[160px]">
              <AuroraHistogramChart
                data={cadence}
                defaultColor={chartPalette.accent}
                formatValue={(v) => `${compactCount(v)} deploys`}
                formatTime={fmtMonth}
              />
            </div>
          ) : (
            <div className="h-[160px] grid place-items-center text-xs text-text-tertiary">
              {history.isLoading ? "Loading…" : "No deploy history available"}
            </div>
          )}
          <div className="text-[10.5px] text-text-tertiary mt-auto">
            {cadencePeak && (
              <>
                peak{" "}
                <span className="mono text-text-secondary">
                  {compactCount(cadencePeak.value)}
                </span>{" "}
                deploys · {fmtMonthYear(cadencePeak.time)}
              </>
            )}
            {cadence.length > 0 && (
              <>
                {" · "}
                <span className="mono text-text-secondary">
                  {compactCount(cadence[cadence.length - 1].value)}
                </span>{" "}
                this month
              </>
            )}
          </div>
        </div>
      </OverviewModule>
    </div>
  );
}
