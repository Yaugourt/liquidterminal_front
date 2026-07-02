"use client";

import { useMemo, useState } from "react";
import {
  KpiRibbon,
  TypedDataTable,
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  StackedShareBar,
  chartPalette,
  type Column,
  type KpiCell,
  type ShareSegment,
} from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { PillTabs } from "@/components/ui/pill-tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useValidators,
  useStakingValidationsPaginated,
} from "@/services/explorer/validator/hooks";
import type { Validator } from "@/services/explorer/validator/types/validators";
import type { FormattedStakingValidation } from "@/services/explorer/validator/types/staking";
import { compactHype } from "@/lib/formatters/numberFormatting";

/** Destination of the "View all" links — the staking activity lives on the validator page. */
const VALIDATIONS_HREF = "/explorer/validator";

/** Status filter for the directory table toolbar. */
type StatusFilter = "all" | "active" | "inactive";

/** Foundation validators are name-prefixed (rule single-sourced server-side). */
function isFoundationName(name: string): boolean {
  return name.startsWith("Hyper Foundation");
}

/** Truncate a 0x address to `0x1234…abcd`. */
function truncateAddress(addr: string): string {
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/**
 * Compact relative time for the activity tape (e.g. "now", "12m", "3h", "5d").
 * The full localized datetime is too wide for the rail column; a relative
 * stamp fits and reads better in a feed.
 */
function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Build a 2-letter avatar from a validator name (neutral initials). */
function initials(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Median of a numeric series (returns 0 for an empty series). */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Small uppercase section label + hint — the v3 section-header pattern. */
function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-[11px] uppercase tracking-[0.1em] font-semibold text-text-tertiary">
        {title}
      </h2>
      {hint && <span className="text-[11px] text-text-tertiary">{hint}</span>}
    </div>
  );
}

/**
 * OperatorLens — the "Operator" (network-health) lens of the validator page.
 *
 * Reads HEALTH → CONTROL → DIRECTORY (mirrors dash-mockups/validator-v4-A-v3):
 * a Network-health KPI band, a stake-concentration StackedShareBar, and a
 * searchable validator directory with a recent-activity rail. No fee data here
 * → ZERO gold; status uses success/inactive (never danger-red); avatars neutral.
 */
export function OperatorLens() {
  const { validators, stats, isLoading, error, refetch } = useValidators();
  const {
    validations,
    total: validationsTotal,
    isLoading: validationsLoading,
    error: validationsError,
  } = useStakingValidationsPaginated({ limit: 8 });

  // Toolbar state — local search + status text-tabs.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const total = stats.totalHypeStaked;

  // ── Derived network-health metrics ────────────────────────────────────
  const medianUptime = useMemo(
    () => median(validators.map((v) => v.uptime)),
    [validators],
  );
  const medianApr = useMemo(
    () => median(validators.map((v) => v.apr)),
    [validators],
  );

  // ── Network control — how stake splits across the set ─────────────────
  // Foundation aggregate (neutral) + top community validators (cyan ramp) +
  // a long-tail segment. Surfaces stake centralization at a glance.
  const controlSegments = useMemo<ShareSegment[]>(() => {
    if (!total) return [];
    const pct = (x: number) => (x / total) * 100;

    const foundationStake = validators
      .filter((v) => isFoundationName(v.name))
      .reduce((sum, v) => sum + v.stake, 0);
    const community = validators
      .filter((v) => !isFoundationName(v.name))
      .sort((a, b) => b.stake - a.stake);
    const TOP = 5;
    const top = community.slice(0, TOP);
    const tail = community.slice(TOP);
    const tailStake = tail.reduce((sum, v) => sum + v.stake, 0);

    const segments: ShareSegment[] = [];
    if (foundationStake > 0) {
      segments.push({
        key: "foundation",
        label: "Hyper Foundation",
        pct: pct(foundationStake),
        fillClassName: "bg-surface-2",
      });
    }
    top.forEach((v, i) => {
      segments.push({
        key: v.validator,
        label: v.name,
        pct: pct(v.stake),
        color: chartPalette.cyanRamp[i] ?? chartPalette.accent,
        labelClassName: "text-brand-text-on",
      });
    });
    if (tailStake > 0) {
      segments.push({
        key: "tail",
        label: `Long tail · ${tail.length} validators`,
        pct: pct(tailStake),
        fillClassName: "bg-surface-3",
      });
    }
    return segments;
  }, [validators, total]);

  // ── Directory: filter (search + status) then sort by stake desc ───────
  const filteredValidators = useMemo(() => {
    const query = search.trim().toLowerCase();
    return validators
      .filter((v) => {
        if (statusFilter === "active" && !v.isActive) return false;
        if (statusFilter === "inactive" && v.isActive) return false;
        if (!query) return true;
        return (
          v.name.toLowerCase().includes(query) ||
          v.validator.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.stake - a.stake);
  }, [validators, search, statusFilter]);

  // ── Directory columns (mirror v3-A: # · Validator · Stake · Share · APR · Uptime · Comm. · Blocks · Status) ──
  const columns: Column<Validator>[] = useMemo(
    () => [
      {
        key: "rank",
        header: "#",
        align: "right",
        width: 48,
        accessor: (_row, _i, absoluteIndex) => (
          <span className="mono text-[11px] text-text-tertiary">
            {absoluteIndex + 1}
          </span>
        ),
      },
      {
        key: "validator",
        header: "Validator",
        accessor: (row) => (
          <div className="flex items-center gap-2 min-w-0">
            <ModuleAsset
              tone="neutral"
              logo={initials(row.name)}
              name={row.name}
              sub={truncateAddress(row.validator)}
            />
            {isFoundationName(row.name) && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-text-tertiary">
                Foundation
              </span>
            )}
          </div>
        ),
      },
      {
        key: "stake",
        header: "Stake",
        align: "right",
        accessor: (row) => (
          <span className="mono text-[13px] text-text-primary">
            {compactHype(row.stake)}
          </span>
        ),
      },
      {
        key: "share",
        header: "Share",
        align: "right",
        accessor: (row) => (
          <span className="mono text-[12.5px] text-text-tertiary">
            {total ? ((row.stake / total) * 100).toFixed(1) : "0.0"}%
          </span>
        ),
      },
      {
        key: "apr",
        header: "APR",
        align: "right",
        // APR is the staking yield → gold (DS: gold carries the reward/value accent).
        accessor: (row) => (
          <span className="mono text-[13px] text-gold">
            {row.apr.toFixed(2)}%
          </span>
        ),
      },
      {
        key: "uptime",
        header: "Uptime",
        align: "right",
        accessor: (row) => (
          <span
            className={`mono text-[13px] ${row.uptime >= 99.9 ? "text-success" : "text-text-secondary"}`}
          >
            {row.uptime.toFixed(1)}%
          </span>
        ),
      },
      {
        key: "commission",
        header: "Comm.",
        align: "right",
        // Commission is the validator's fee on rewards → gold (DS: gold = fees).
        accessor: (row) => (
          <span className="mono text-[12.5px] text-gold">
            {row.commission.toFixed(1)}%
          </span>
        ),
      },
      {
        key: "blocks",
        header: "Blocks",
        align: "right",
        accessor: (row) => (
          <span className="mono text-[13px] text-text-secondary">
            {row.nRecentBlocks}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "right",
        accessor: (row) => (
          <StatusBadge variant={row.isActive ? "success" : "inactive"}>
            {row.isActive ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
    ],
    [total],
  );

  // ── Network-health KPI band (single 5-up, mirrors v3-A) ───────────────
  const healthCells: KpiCell[] = [
    {
      key: "total-staked",
      label: "Total staked",
      value: compactHype(total),
      sub: "HYPE delegated",
    },
    {
      key: "validators",
      label: "Validators",
      value: (
        <>
          {stats.active}
          <span className="text-[12px] font-medium text-text-tertiary">
            /{stats.total}
          </span>
        </>
      ),
      sub: "active / total",
    },
    {
      key: "median-uptime",
      label: "Median uptime",
      value: `${medianUptime.toFixed(1)}%`,
      sub: "last 24h",
      tone: "success",
    },
    {
      key: "median-apr",
      label: "Median APR",
      value: `${medianApr.toFixed(2)}%`,
      sub: "est. annualized",
      tone: "gold",
    },
    {
      key: "inactive",
      label: "Inactive",
      value: stats.inactive,
      sub: "not producing",
    },
  ];

  const statusTabs = [
    { value: "all", label: <>All <span className="mono text-text-tertiary">{stats.total}</span></> },
    { value: "active", label: <>Active <span className="mono">{stats.active}</span></> },
    { value: "inactive", label: <>Inactive <span className="mono">{stats.inactive}</span></> },
  ];

  // Directory toolbar — search input + status text-tabs + count.
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or address…"
          className="w-full px-3 h-8 text-[12.5px] bg-transparent border border-border-subtle rounded-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-default"
        />
      </div>
      <PillTabs
        variant="text"
        tabs={statusTabs}
        activeTab={statusFilter}
        onTabChange={(v) => setStatusFilter(v as StatusFilter)}
      />
      <span className="text-text-tertiary text-[11.5px] ml-auto shrink-0">
        {filteredValidators.length} validator{filteredValidators.length === 1 ? "" : "s"}
      </span>
    </div>
  );

  return (
    <div className="space-y-7">
      {/* ───────────── Network health ───────────── */}
      <section className="space-y-3">
        <SectionLabel title="Network health" hint="Active set, right now" />
        <KpiRibbon
          variant="plain"
          cells={healthCells}
          columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
        />
      </section>

      {/* ───────────── Network control ───────────── */}
      {controlSegments.length > 0 && (
        <section className="space-y-3">
          <SectionLabel
            title="Network control"
            hint={`How ${compactHype(total)} HYPE is distributed across the set`}
          />
          <div className="bg-surface border border-border-subtle rounded-lg p-5">
            <StackedShareBar
              title="Stake share"
              caption={
                <>
                  Foundation controls{" "}
                  <span className="text-text-primary font-medium">
                    {controlSegments[0]?.pct.toFixed(1)}%
                  </span>{" "}
                  of staked HYPE
                </>
              }
              segments={controlSegments}
            />
          </div>
        </section>
      )}

      {/* ───────────── Validator directory ───────────── */}
      <section className="space-y-3">
        <SectionLabel title="Validator directory" hint="Sorted by stake" />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
          {/* LEFT — searchable / filterable validator table */}
          <div className="min-w-0 bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <TypedDataTable<Validator>
              data={filteredValidators}
              columns={columns}
              getRowKey={(row) => row.validator}
              density="compact"
              headerFill={false}
              paginationVariant="compact"
              paginate
              itemsPerPage={15}
              toolbar={toolbar}
              isLoading={isLoading}
              error={error}
              onErrorRetry={refetch}
              errorTitle="Could not load validators"
              emptyMessage="No validators match your filters"
              emptyDescription="Try a different search or status."
            />
          </div>

          {/* RIGHT — slim recent staking activity rail */}
          <aside className="xl:sticky xl:top-6">
            <OverviewModule
              title="Recent staking activity"
              tagVariant="plain"
              tag={validationsTotal > 0 ? `${validationsTotal} events` : undefined}
              href={VALIDATIONS_HREF}
              viewAllLabel="View all"
            >
              {validationsLoading ? (
                <LoadingState message="Loading…" size="md" withCard={false} />
              ) : validationsError ? (
                <ErrorState
                  title="Could not load activity"
                  message={validationsError.message}
                  withCard={false}
                />
              ) : validations.length === 0 ? (
                <EmptyState
                  title="No recent activity"
                  description="Delegations will appear here."
                />
              ) : (
                <ModuleTable
                  density="compact"
                  columns={[
                    { header: "When", align: "left", width: 52 },
                    { header: "Type", align: "left" },
                    { header: "Amount", align: "right", width: 84 },
                  ]}
                >
                  {validations.map((v: FormattedStakingValidation) => (
                    <ModuleTableRow
                      key={v.hash}
                      cells={[
                        <span key="t" className="mono text-[11px] text-text-tertiary" title={v.time}>
                          {relativeTime(v.timestamp)}
                        </span>,
                        <div key="type" className="space-y-1">
                          <StatusBadge variant="neutral" className="text-[10.5px] font-medium">
                            {v.type}
                          </StatusBadge>
                          <div className="mono text-[10px] text-text-tertiary truncate">
                            {truncateAddress(v.validator)}
                          </div>
                        </div>,
                        <span key="amt" className="mono text-[12px] text-text-secondary">
                          {compactHype(v.amount)}
                        </span>,
                      ]}
                    />
                  ))}
                </ModuleTable>
              )}
            </OverviewModule>
          </aside>
        </div>
      </section>
    </div>
  );
}
