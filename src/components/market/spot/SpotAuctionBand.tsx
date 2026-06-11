"use client";

import { useMemo, useState } from "react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  FlowBar,
  AuroraHistogramChart,
  chartPalette,
} from "@/components/common";
import { compactUsd, compactHype } from "@/lib/formatters/numberFormatting";
import { useAuctionTiming } from "@/services/market/auction/hooks/useAuctionTiming";
import { useLatestAuctions } from "@/services/market/auction/hooks/useAuctions";

const DAY_MS = 86_400_000;

const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function fmtAgo(ms: number, now: number): string {
  const d = Math.floor((now - ms) / DAY_MS);
  if (d >= 1) return `${d}d`;
  const h = Math.floor((now - ms) / 3_600_000);
  return h >= 1 ? `${h}h` : "now";
}

/**
 * "Deploy auctions" band for /market/spot — live HIP-1 dutch-auction state,
 * the gas actually paid over the last 90d, and the latest deploys. Links to
 * /market/spot/auction for the full history.
 *
 * 7d aggregates are computed here from `useLatestAuctions` (ms timestamps) —
 * the `avg7dPrice`/`deploys7d` fields of `useAuctionTiming` mix up s/ms and
 * over-count, so they are deliberately not used.
 */
export function SpotAuctionBand() {
  const { auctionState } = useAuctionTiming();
  const { auctions, isLoading: auctionsLoading } = useLatestAuctions(60, "HYPE");
  const [now] = useState(() => Date.now());

  const sorted = useMemo(
    () => [...auctions].sort((a, b) => b.time - a.time),
    [auctions]
  );

  const gasEvents = useMemo(
    () =>
      sorted
        .filter((a) => a.time >= now - 90 * DAY_MS && parseFloat(a.deployGasAbs) > 0)
        .map((a) => ({ time: a.time, value: parseFloat(a.deployGasAbs) })),
    [sorted, now]
  );

  const stats7d = useMemo(() => {
    const recent = sorted.filter(
      (a) => a.time >= now - 7 * DAY_MS && parseFloat(a.deployGas) > 0
    );
    const avg = recent.length
      ? recent.reduce((s, a) => s + parseFloat(a.deployGas), 0) / recent.length
      : 0;
    return { count: recent.length, avg };
  }, [sorted, now]);

  const peak = useMemo(() => {
    if (!gasEvents.length) return null;
    const max = gasEvents.reduce((m, p) => (p.value > m.value ? p : m), gasEvents[0]);
    const auction = sorted.find((a) => a.time === max.time);
    return { ...max, name: auction?.name ?? "?" };
  }, [gasEvents, sorted]);

  const recentDeploys = sorted.slice(0, 5);

  // Position on the dutch curve: 0 = at start gas, 1 = at the floor.
  const curvePos =
    auctionState.startPrice > auctionState.floorPrice
      ? Math.min(
          1,
          Math.max(
            0,
            (auctionState.startPrice - auctionState.currentPrice) /
              (auctionState.startPrice - auctionState.floorPrice)
          )
        )
      : 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {/* Live dutch-auction state */}
      <OverviewModule
        title="Current auction"
        tag={
          auctionState.isActive ? (
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              live
            </span>
          ) : (
            "between auctions"
          )
        }
        tagVariant="plain"
      >
        <div className="px-4 py-3.5 flex flex-col flex-1">
          <div className="mono text-[26px] font-medium tracking-[-0.01em] leading-none text-text-primary">
            {compactHype(auctionState.currentPrice)}{" "}
            <span className="text-[14px] text-text-tertiary">HYPE</span>
          </div>
          <div className="text-[10.5px] text-text-tertiary mt-1.5">
            ≈ <span className="mono">{compactUsd(auctionState.currentPriceUSD)}</span> ·{" "}
            {auctionState.isActive ? "deploy gas now" : "next start gas"}
          </div>
          <div className="mt-3.5 space-y-1.5">
            <FlowBar ratio={curvePos} height={4} />
            <div className="flex justify-between mono text-[9.5px] text-text-tertiary">
              <span>start {compactHype(auctionState.startPrice)}</span>
              <span>floor {compactHype(auctionState.floorPrice)}</span>
            </div>
          </div>
          <div className="mt-3 flex-1 flex flex-col justify-end divide-y divide-border-subtle text-[11.5px]">
            <div className="flex items-baseline justify-between py-2">
              <span className="text-text-tertiary">
                {auctionState.isActive ? "Window ends" : "Next auction"}
              </span>
              <span className="mono text-text-secondary">
                {auctionState.isActive
                  ? `in ${auctionState.timeRemaining}`
                  : `in ${auctionState.nextAuctionStart}`}
              </span>
            </div>
            {auctionState.isActive && auctionState.etaToLastSold !== "—" && (
              <div className="flex items-baseline justify-between py-2">
                <span className="text-text-tertiary">Crosses last price</span>
                <span className="mono text-text-secondary">{auctionState.etaToLastSold}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between py-2">
              <span className="text-text-tertiary">
                Last sold · {auctionState.lastAuctionName}
              </span>
              <span className="mono text-text-secondary">
                {compactHype(auctionState.lastAuctionPrice)} HYPE
              </span>
            </div>
          </div>
        </div>
      </OverviewModule>

      {/* Gas actually paid, last 90d */}
      <OverviewModule title="Deploy gas paid" tag="90d · HYPE" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
          {gasEvents.length >= 2 ? (
            <div className="h-[180px]">
              <AuroraHistogramChart
                data={gasEvents}
                defaultColor={chartPalette.accent}
                formatValue={(v) => `${compactHype(v)} HYPE`}
                formatTime={fmtDay}
              />
            </div>
          ) : (
            <div className="h-[180px] grid place-items-center text-xs text-text-tertiary">
              {auctionsLoading
                ? "Loading…"
                : gasEvents.length === 1
                  ? `1 deploy in 90d — ${compactHype(gasEvents[0].value)} HYPE`
                  : "No deploys in the last 90d"}
            </div>
          )}
          <div className="text-[10.5px] text-text-tertiary mt-auto">
            {peak && (
              <>
                peak <span className="mono text-text-secondary">{compactHype(peak.value)}</span>{" "}
                ({peak.name} · {fmtDay(peak.time)}) ·{" "}
              </>
            )}
            <span className="mono text-text-secondary">{stats7d.count}</span> deploy
            {stats7d.count !== 1 ? "s" : ""} · 7d
            {stats7d.count > 0 && (
              <>
                {" · avg "}
                <span className="mono text-text-secondary">{compactHype(stats7d.avg)}</span>
              </>
            )}
          </div>
        </div>
      </OverviewModule>

      {/* Latest deploys */}
      <OverviewModule
        title="Recent deploys"
        href="/market/spot/auction"
        viewAllLabel="All auctions"
      >
        <ModuleTable
          columns={[
            { header: "Token" },
            { header: "Gas", width: 88 },
            { header: "When", width: 56 },
          ]}
        >
          {recentDeploys.map((a) => (
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
                <span
                  key="g"
                  className={`mono ${
                    parseFloat(a.deployGasAbs) > auctionState.floorPrice
                      ? "font-medium text-gold"
                      : "text-text-secondary"
                  }`}
                >
                  {compactHype(parseFloat(a.deployGasAbs))}
                </span>,
                <span key="w" className="mono text-[11px] text-text-tertiary">
                  {fmtAgo(a.time, now)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>
    </div>
  );
}
