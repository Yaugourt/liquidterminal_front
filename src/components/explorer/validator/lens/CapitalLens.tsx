"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  KpiRibbon,
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  DonutTopN,
  FlowGrid,
  FlowBar,
  AuroraHistogramChart,
  chartPalette,
  type KpiCell,
  type DonutSlice,
  type FlowGridColumn,
  type HistogramDataPoint,
} from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useValidators,
  useValidatorVotes,
  useHoldersStats,
} from "@/services/explorer/validator/hooks";
import {
  useUnstakingStatsData,
  useUnstakingStatsForChart,
} from "@/services/explorer/validator/hooks/staking";
import type { Validator } from "@/services/explorer/validator/types/validators";
import type { TopHoldersStats } from "@/services/explorer/validator/types/holders";
import { compactHype, compactCount } from "@/lib/formatters/numberFormatting";

/** Capital section header — 15px medium title + hint + optional right actions (mirrors v3-B). */
function SectionHead({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-[15px] font-medium text-text-primary">{title}</h2>
      {hint && <span className="text-[11px] text-text-tertiary">{hint}</span>}
      {actions && <div className="ml-auto shrink-0">{actions}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * CapitalLens — the "Capital" (concentration) lens of the validator page.
 *
 * Answers "Where does stake sit, and how Foundation-dependent is the network?".
 * Three sections: Concentration (KPI ribbon + donut composition + flow ranking),
 * Delegators (staker-size histogram + top-N share table) and Exit pressure
 * (unstaking-queue KPI ribbon + daily unstaking area chart).
 *
 * Color discipline (hard rule): gold is fee-only and there are NO fees here, so
 * every bar / slice / area uses the cyan accent (chartPalette.accent). The donut
 * sources from chartPalette.multiSeries in index order, SKIPPING index 2 (gold).
 * Foundation validators are identified with a NEUTRAL tag (surface-2), never gold.
 * ────────────────────────────────────────────────────────────────────────── */

/** ex-Foundation toggle state. "community" excludes Foundation validators. */
type ConcentrationView = "all" | "community";

/** Per-validator Foundation flag — Foundation operators share this name prefix. */
function isFoundation(v: Validator): boolean {
  return v.name.startsWith("Hyper Foundation");
}

/** Number of community validators surfaced individually in the donut/flow. */
const TOP_N = 6;
/** Number of validators surfaced in the flow ranking. */
const FLOW_N = 8;

/** Map the multiSeries palette skipping index 2 (gold = fees-only). */
const STAKE_SERIES = chartPalette.multiSeries.filter(
  (_, i) => i !== 2,
) as readonly string[];

/** Neutral fill for the "Rest" donut slice — a muted chart-palette step (never
 *  gold). Sourced from chartPalette so no raw hex lives in component code. */
const REST_COLOR = chartPalette.brandSecondary;

/** HHI concentration label from the Herfindahl-Hirschman index value. */
function hhiLabel(hhi: number): string {
  if (hhi < 1500) return "low concentration";
  if (hhi < 2500) return "moderate concentration";
  return "high concentration";
}

export function CapitalLens() {
  const {
    validators,
    isLoading: validatorsLoading,
    error: validatorsError,
    refetch: refetchValidators,
  } = useValidators();
  // Foundation split is single-sourced server-side via the votes stats.
  const { stats: voteStats } = useValidatorVotes();
  const {
    stats: holdersStats,
    isLoading: holdersLoading,
    error: holdersError,
  } = useHoldersStats();
  const {
    totalStats: unstakingTotals,
    upcomingUnstaking,
    isLoading: unstakingLoading,
    error: unstakingError,
  } = useUnstakingStatsData();
  const {
    dailyStats: unstakingDaily,
    isLoading: unstakingChartLoading,
    error: unstakingChartError,
  } = useUnstakingStatsForChart();

  const [view, setView] = useState<ConcentrationView>("all");

  // ── Foundation split (server-sourced) ──────────────────────────────────
  const totalStake = voteStats.totalStake;
  const foundationStake = voteStats.foundationStake;
  const communityStake = voteStats.communityStake;
  const foundationSharePct = totalStake > 0 ? (foundationStake / totalStake) * 100 : 0;

  // ── Validator partitioning ──────────────────────────────────────────────
  const foundationValidators = useMemo(
    () => validators.filter(isFoundation),
    [validators],
  );
  const communityValidators = useMemo(
    () => validators.filter((v) => !isFoundation(v)),
    [validators],
  );

  // The set the concentration metrics describe (toggle-driven).
  const activeSet = view === "community" ? communityValidators : validators;
  // Denominator the shares are computed against.
  const activeDenominator =
    view === "community"
      ? communityValidators.reduce((sum, v) => sum + v.stake, 0)
      : validators.reduce((sum, v) => sum + v.stake, 0);

  // ── Concentration metrics ───────────────────────────────────────────────
  const sortedByStake = useMemo(
    () => [...activeSet].sort((a, b) => b.stake - a.stake),
    [activeSet],
  );

  const shares = useMemo(
    () =>
      activeDenominator > 0
        ? sortedByStake.map((v) => (v.stake / activeDenominator) * 100)
        : [],
    [sortedByStake, activeDenominator],
  );

  // HHI = Σ(share%)² over every validator in the active set.
  const hhi = useMemo(
    () => shares.reduce((sum, s) => sum + s * s, 0),
    [shares],
  );

  const top5Pct = shares.slice(0, 5).reduce((sum, s) => sum + s, 0);

  // ── Donut composition ─────────────────────────────────────────────────
  // "all" view: Foundation aggregate + top community validators + Rest.
  // "community" view: top community validators + Rest (no Foundation slice).
  const donutSlices = useMemo<DonutSlice[]>(() => {
    if (activeDenominator <= 0) return [];
    const slices: DonutSlice[] = [];

    let paletteIdx = 0;
    if (view === "all") {
      // Foundation aggregate slice — first cyan step, neutral identity (tagged
      // in the legend, not gold). Uses the server-sourced foundation share.
      slices.push({
        key: "foundation",
        name: `Hyper Foundation (${foundationValidators.length})`,
        value: foundationSharePct,
        color: STAKE_SERIES[0],
      });
      paletteIdx = 1;
    }

    const topCommunity = [...communityValidators]
      .sort((a, b) => b.stake - a.stake)
      .slice(0, TOP_N);

    let accountedPct = view === "all" ? foundationSharePct : 0;
    for (const v of topCommunity) {
      const pct = (v.stake / activeDenominator) * 100;
      accountedPct += pct;
      slices.push({
        key: v.validator,
        name: v.name,
        value: pct,
        color: STAKE_SERIES[paletteIdx % STAKE_SERIES.length],
      });
      paletteIdx += 1;
    }

    const restPct = Math.max(0, 100 - accountedPct);
    const restCount =
      communityValidators.length - Math.min(TOP_N, communityValidators.length);
    if (restPct > 0.01 && restCount > 0) {
      slices.push({
        key: "rest",
        name: `Rest · ${restCount} validators`,
        value: restPct,
        color: REST_COLOR,
      });
    }
    return slices;
  }, [
    view,
    activeDenominator,
    foundationSharePct,
    foundationValidators.length,
    communityValidators,
  ]);

  // ── Flow ranking ──────────────────────────────────────────────────────
  // Top-N validators by stake in the active set; bar ratio is share of #1.
  const flowRows = useMemo(() => {
    const top = sortedByStake.slice(0, FLOW_N);
    const maxStake = top[0]?.stake ?? 0;
    return top.map((v) => ({
      key: v.validator,
      name: v.name,
      foundation: isFoundation(v),
      pct: activeDenominator > 0 ? (v.stake / activeDenominator) * 100 : 0,
      stake: v.stake,
      ratio: maxStake > 0 ? v.stake / maxStake : 0,
    }));
  }, [sortedByStake, activeDenominator]);

  type FlowRow = (typeof flowRows)[number];

  const flowColumns: FlowGridColumn<FlowRow>[] = useMemo(
    () => [
      {
        header: "Validator",
        width: 160,
        align: "left",
        render: (row) => (
          <span className="flex items-center gap-1.5 truncate text-text-secondary">
            <span className="truncate">{row.name}</span>
            {row.foundation && (
              <span className="shrink-0 rounded border border-border-subtle bg-surface-2 px-1 py-0.5 text-[9px] text-text-tertiary">
                F
              </span>
            )}
          </span>
        ),
      },
      {
        header: "Share",
        width: "1fr",
        render: (row, i) => (
          <FlowBar
            ratio={row.ratio}
            color={chartPalette.accent}
            variant="gradient"
            delay={i * 0.03}
          />
        ),
      },
      {
        header: "%",
        width: 56,
        align: "right",
        render: (row) => (
          <span className="mono text-text-primary">{row.pct.toFixed(1)}%</span>
        ),
      },
    ],
    [],
  );

  // ── Delegator histogram ──────────────────────────────────────────────
  // x = bucket index (time), value = holdersCount. Emphasize the largest
  // bucket(s) via opacity, never gold.
  const distribution = useMemo(
    () => holdersStats?.distributionByRange ?? [],
    [holdersStats],
  );
  const histogramData = useMemo<HistogramDataPoint[]>(
    () =>
      distribution.map((d, i) => ({
        time: i,
        value: d.holdersCount,
        // Brand accent everywhere; the dominant bucket reads full-opacity,
        // the rest dimmed — emphasis via opacity, not color.
        color: chartPalette.accent,
      })),
    [distribution],
  );
  const rangeLabels = useMemo(
    () => distribution.map((d) => d.range),
    [distribution],
  );

  // ── Delegator concentration table ──────────────────────────────────────
  const topHolders: TopHoldersStats[] = holdersStats?.topHoldersStats ?? [];
  const totalHolders = holdersStats?.totalHolders ?? 0;

  // ── Exit-pressure daily volume (column chart) ─────────────────────────────
  // Unstaking is sparse and spiky — discrete bars read honestly, where a
  // smoothed area chart would fake a continuous trend.
  const volumeData = useMemo<HistogramDataPoint[]>(() => {
    return unstakingDaily
      .map((d) => ({ time: Date.parse(d.date), value: d.totalTokens }))
      .filter((p) => Number.isFinite(p.time));
  }, [unstakingDaily]);

  // ── Concentration KPI cells ─────────────────────────────────────────────
  const headlineCell: KpiCell =
    view === "community"
      ? {
          key: "headline",
          label: "Community stake",
          value: compactHype(communityStake),
          sub: `${communityValidators.length} validators · ${
            totalStake > 0
              ? ((communityStake / totalStake) * 100).toFixed(1)
              : "0.0"
          }% of total`,
        }
      : {
          key: "headline",
          label: "Foundation share",
          value: `${foundationSharePct.toFixed(1)}%`,
          sub: `${compactHype(foundationStake)} HYPE · ${
            foundationValidators.length
          } validators`,
        };

  const concentrationCells: KpiCell[] = [
    headlineCell,
    {
      key: "hhi",
      label: "HHI",
      value: Math.round(hhi).toLocaleString(),
      sub: hhiLabel(hhi),
    },
    {
      key: "top5",
      label: "Top-5",
      value: `${top5Pct.toFixed(1)}%`,
      sub: "cumulative",
    },
    {
      key: "total-staked",
      label: "Total staked",
      value: compactHype(totalStake),
      sub: "HYPE",
    },
    {
      key: "holders",
      label: "Holders",
      value: compactCount(totalHolders),
      sub: "staking wallets",
    },
  ];

  // ── Exit-pressure KPI cells ──────────────────────────────────────────────
  const queueCells: KpiCell[] = [
    {
      key: "queued",
      label: "Total queued",
      value: compactHype(unstakingTotals?.totalTokens ?? null),
      sub: unstakingTotals
        ? `${unstakingTotals.totalTransactions.toLocaleString()} entries`
        : undefined,
    },
    {
      key: "next-hour",
      label: "Next hour",
      value: compactHype(upcomingUnstaking?.nextHour.totalTokens ?? null),
      sub: upcomingUnstaking
        ? `${upcomingUnstaking.nextHour.transactionCount.toLocaleString()} tx`
        : undefined,
    },
    {
      key: "next-24h",
      label: "Next 24h",
      value: compactHype(upcomingUnstaking?.next24Hours.totalTokens ?? null),
      sub: upcomingUnstaking
        ? `${upcomingUnstaking.next24Hours.transactionCount.toLocaleString()} tx`
        : undefined,
    },
    {
      key: "next-7d",
      label: "Next 7d",
      value: compactHype(upcomingUnstaking?.next7Days.totalTokens ?? null),
      sub: upcomingUnstaking
        ? `${upcomingUnstaking.next7Days.transactionCount.toLocaleString()} tx`
        : undefined,
    },
  ];

  // ── ex-Foundation toggle (top-right of the first section) ────────────────
  const concentrationToggle = (
    <PillTabs
      variant="text"
      tabs={[
        { value: "all", label: "All validators" },
        { value: "community", label: "Community" },
      ]}
      activeTab={view}
      onTabChange={(v) => setView(v as ConcentrationView)}
    />
  );

  const flowCaption =
    view === "community"
      ? `share of community (${compactHype(communityStake)})`
      : "share of total";

  const top100Bucket = top1OrNull(holdersStats?.topHoldersStats);

  return (
    <div className="space-y-7">
      {/* ───────────── §Concentration ───────────── */}
      <section className="space-y-4">
        <SectionHead
          title="Concentration"
          hint="Foundation dependence and top-N stake share."
          actions={concentrationToggle}
        />
        {validatorsError ? (
          <ErrorState
            title="Could not load validators"
            message={validatorsError.message}
            onRetry={refetchValidators}
          />
        ) : validatorsLoading ? (
          <LoadingState message="Loading concentration…" size="md" />
        ) : validators.length === 0 ? (
          <EmptyState
            title="No validators"
            description="Stake distribution will appear here."
          />
        ) : (
          <>
            <KpiRibbon variant="plain" cells={concentrationCells} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* LEFT — stake composition donut */}
              <div className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface">
                <div className="flex items-baseline gap-2 border-b border-border-subtle px-4 py-3">
                  <h3 className="text-[13px] font-medium text-text-primary">
                    Stake composition
                  </h3>
                  <span className="mono ml-auto text-[11px] text-text-tertiary">
                    of {compactHype(activeDenominator)} HYPE
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-5 p-4 sm:flex-row">
                  <DonutTopN
                    data={donutSlices}
                    size={150}
                    variant="dim-others"
                    useGradient={false}
                    center={
                      <div className="flex flex-col items-center">
                        <span className="mono text-[17px] font-semibold text-text-primary">
                          {view === "community"
                            ? compactHype(communityStake)
                            : `${foundationSharePct.toFixed(1)}%`}
                        </span>
                        <span className="text-[9px] text-text-tertiary">
                          {view === "community" ? "Community" : "Foundation"}
                        </span>
                      </div>
                    }
                  />
                  <div className="w-full min-w-0 flex-1 space-y-1.5 self-center">
                    {donutSlices.map((s) => {
                      const isFoundationSlice = s.key === "foundation";
                      return (
                        <div
                          key={s.key}
                          className="flex items-center gap-2 text-[12px]"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ background: s.color }}
                          />
                          <span className="min-w-0 truncate text-text-secondary">
                            {s.name}
                          </span>
                          {isFoundationSlice && (
                            <span className="shrink-0 rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[9.5px] text-text-tertiary">
                              Foundation
                            </span>
                          )}
                          <span className="mono ml-auto text-text-primary">
                            {s.value.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT — top validators by stake (flow ranking) */}
              <div className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface">
                <div className="flex items-baseline gap-2 border-b border-border-subtle px-4 py-3">
                  <h3 className="text-[13px] font-medium text-text-primary">
                    Top validators by stake
                  </h3>
                  <span className="mono ml-auto text-[11px] text-text-tertiary">
                    {flowCaption}
                  </span>
                </div>
                <div className="flex-1 p-4">
                  <FlowGrid<FlowRow>
                    rows={flowRows}
                    rowKey={(r) => r.key}
                    columns={flowColumns}
                    showHeaders={false}
                    rowGap={10}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-text-tertiary">
              Composition (left) shows where stake sits; ranking (right) shows
              the largest single validators. Foundation validators are tagged,
              not colored.
            </p>
          </>
        )}
      </section>

      {/* ───────────── §Distribution ───────────── */}
      <section className="space-y-4">
        <SectionHead
          title="Distribution"
          hint={`How the ${compactCount(totalHolders)} staking wallets are distributed.`}
        />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* LEFT — stakers-by-size histogram */}
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="flex items-baseline gap-2 border-b border-border-subtle px-4 py-3">
              <h3 className="text-[13px] font-medium text-text-primary">
                Stakers by size
              </h3>
              <span className="mono ml-auto text-[11px] text-text-tertiary">
                {compactCount(totalHolders)} wallets
              </span>
            </div>
            <div className="p-4">
              {holdersError ? (
                <ErrorState
                  title="Could not load delegators"
                  message={holdersError.message}
                  withCard={false}
                />
              ) : holdersLoading ? (
                <LoadingState message="Loading distribution…" size="md" withCard={false} />
              ) : distribution.length === 0 ? (
                <EmptyState
                  title="No distribution data"
                  description="Staker buckets will appear here."
                />
              ) : (
                <div className="h-[170px]">
                  <AuroraHistogramChart
                    data={histogramData}
                    barRadius={2}
                    formatValue={(v) => compactCount(v)}
                    formatTime={(t) => rangeLabels[Math.round(t)] ?? ""}
                  />
                </div>
              )}
              {top100Bucket && (
                <p className="mt-3 text-[12px] text-text-secondary">
                  The largest cohort holds a dominant share of staked HYPE —
                  see the concentration table for the exact cumulative split.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — delegator concentration (top-N share) */}
          <OverviewModule title="Delegator concentration">
            {holdersError ? (
              <ErrorState
                title="Could not load concentration"
                message={holdersError.message}
                withCard={false}
              />
            ) : holdersLoading ? (
              <LoadingState message="Loading…" size="md" withCard={false} />
            ) : topHolders.length === 0 ? (
              <EmptyState
                title="No data"
                description="Top-holder shares will appear here."
              />
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  { header: "Cohort", align: "left" },
                  { header: "Share of stake", align: "right" },
                ]}
              >
                {topHolders.map((h) => (
                  <ModuleTableRow
                    key={h.topCount}
                    cells={[
                      <span key="c" className="text-text-secondary">
                        Top {h.topCount.toLocaleString()}
                      </span>,
                      <span key="p" className="mono text-text-secondary">
                        {h.percentage.toFixed(2)}%
                      </span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </OverviewModule>
        </div>
      </section>

      {/* ───────────── §Exit pressure ───────────── */}
      <section className="space-y-4">
        <SectionHead
          title="Exit pressure"
          hint="Stake queued to leave, and the recent unstaking trend."
        />
        {unstakingError ? (
          <ErrorState
            title="Could not load unstaking queue"
            message={unstakingError.message}
          />
        ) : unstakingLoading ? (
          <LoadingState message="Loading exit pressure…" size="md" />
        ) : (
          <KpiRibbon variant="plain" cells={queueCells} />
        )}

        {/* Daily unstaking volume — single cyan series, full daily history. */}
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="flex items-baseline gap-2 border-b border-border-subtle px-4 py-3">
            <h3 className="text-[13px] font-medium text-text-primary">
              Daily unstaking volume
            </h3>
            <span className="mono ml-auto text-[11px] text-text-tertiary">
              HYPE · daily
            </span>
          </div>
          <div className="p-4">
            {unstakingChartError ? (
              <ErrorState
                title="Could not load unstaking history"
                message={unstakingChartError.message}
                withCard={false}
              />
            ) : unstakingChartLoading ? (
              <LoadingState message="Loading chart…" size="md" withCard={false} />
            ) : volumeData.length === 0 ? (
              <EmptyState
                title="No unstaking history"
                description="Daily unstaking volume will appear here."
              />
            ) : (
              <div className="h-[200px]">
                <AuroraHistogramChart
                  data={volumeData}
                  defaultColor={chartPalette.accent}
                  formatValue={(v) => compactHype(v)}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Return the first top-holder bucket if any (drives the histogram caption). */
function top1OrNull(
  stats: TopHoldersStats[] | undefined,
): TopHoldersStats | null {
  return stats && stats.length > 0 ? stats[0] : null;
}
