"use client";

import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, RowFillList, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber, formatPct } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumUsers } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, completeDays } from "./shared";

/** Retention cell tinted by strength so the cohort table reads at a glance. */
function RetentionCell({ v }: { v: number | null }) {
  if (v == null) return <span className="mono text-text-tertiary">{EMPTY}</span>;
  const tone = v >= 0.3 ? "text-success" : v >= 0.1 ? "text-text-primary" : "text-text-tertiary";
  return <span className={`mono ${tone}`}>{formatPct(v, { decimals: 0, fallback: EMPTY })}</span>;
}

/**
 * Elysium · Users: who is active, who is new, who comes back, and how much of
 * the activity comes from a handful of addresses (bots). Computed by our
 * backend from every indexed, non-spam transaction.
 */
export function ElysiumUsers() {
  const { format } = useNumberFormat();
  const { data, isLoading, error } = useElysiumUsers(14);
  const days = completeDays(data?.daily);
  const last = days[days.length - 1];
  const c = data?.concentration24h;

  const cells: KpiCell[] = [
    { key: "active", label: "Active addresses", value: last ? formatNumber(last.active, format, { maximumFractionDigits: 0 }) : "…", sub: last?.day },
    { key: "new", label: "New addresses", value: last ? formatNumber(last.new, format, { maximumFractionDigits: 0 }) : "…", sub: last ? `${formatPct(last.active ? last.new / last.active : null, { decimals: 0, fallback: EMPTY })} of active` : undefined },
    { key: "ret", label: "Returning", value: last ? formatNumber(last.returning, format, { maximumFractionDigits: 0 }) : "…", sub: last?.day },
    {
      key: "top10",
      label: "Top 10 senders",
      value: c ? formatPct(c.top10Share, { decimals: 0, fallback: EMPTY }) : "…",
      tone: c && c.top10Share > 0.5 ? "danger" : undefined,
      sub: c ? `of ${compactCount(c.txs)} txs, 24h` : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <DailyChartCard
        title="Active, new and returning addresses"
        rows={days}
        loading={isLoading}
        defs={[
          { id: "active", name: "Active", color: chartPalette.accent, axis: "left", pick: (r) => r.active, format: (v) => compactCount(v) },
          { id: "new", name: "New", color: chartPalette.gold, axis: "left", pick: (r) => r.new, format: (v) => compactCount(v) },
        ]}
      />
      {/* Stretch: the retention table (one row per day since genesis) sets the height, the senders list fills it. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden flex flex-col">
          <CardHead
            title="Retention by first-seen day"
            tag="share still active 1 and 7 days later"
          />
          <div className="overflow-x-auto">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : !data.retention.some((r) => r.size > 0) ? (
              <Empty>No new address indexed in the last 14 days.</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  { header: "Cohort", width: 108 },
                  { header: "New", width: 76 },
                  { header: "D+1", width: 60 },
                  { header: "D+7", width: 60 },
                ]}
              >
                {/* Newest cohorts first; empty cohorts (early days) carry no signal. */}
                {[...data.retention].filter((r) => r.size > 0).sort((a, b) => b.cohortDay.localeCompare(a.cohortDay)).map((r) => (
                  <ModuleTableRow
                    key={r.cohortDay}
                    cells={[
                      <span key="c" className="mono text-text-secondary">{r.cohortDay}</span>,
                      <span key="n" className="mono text-text-primary">{compactCount(r.size)}</span>,
                      <RetentionCell key="d1" v={r.d1} />,
                      <RetentionCell key="d7" v={r.d7} />,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </div>
        </Card>
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHead
            title="Busiest senders"
            tag="last 24h, likely bots on top"
          />
          <RowFillList mobileHeight="h-[360px]">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : data.topSenders24h.length === 0 ? (
              <Empty>No transaction indexed in the last 24h.</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  // Targets needs room that phones and lg's half-width cards do not have.
                  { header: "Address", width: 130 },
                  { header: "Txs", width: 76 },
                  { header: "Share", width: 76 },
                  { header: "Targets", width: 80, className: "hidden sm:table-cell lg:hidden xl:table-cell" },
                ]}
              >
                {data.topSenders24h.map((s) => (
                  <ModuleTableRow
                    key={s.address}
                    cells={[
                      <span key="a" className="mono whitespace-nowrap">
                        <AddrLink address={s.address} className="text-text-secondary" />
                      </span>,
                      <span key="tx" className="mono whitespace-nowrap text-text-primary">{compactCount(s.txs)}</span>,
                      <span key="sh" className="mono whitespace-nowrap text-text-tertiary">{formatPct(s.share, { decimals: 1, fallback: EMPTY })}</span>,
                      <span key="tg" className="mono whitespace-nowrap text-text-tertiary" title="Distinct contracts or addresses it sent to">
                        {compactCount(s.distinctTargets)}
                      </span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </RowFillList>
        </Card>
      </div>
      <p className="text-[11px] text-text-tertiary">
        An address counts as active on a day when it sends at least one non-spam transaction. New = first transaction ever seen on Elysium.
      </p>
    </div>
  );
}
