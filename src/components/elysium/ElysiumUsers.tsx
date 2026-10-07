"use client";

import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, RowFillList, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumUsers } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, completeDays, pct } from "./shared";

/** Retention cell tinted by strength so the cohort table reads at a glance. */
function RetentionCell({ v }: { v: number | null }) {
  if (v == null) return <td className="px-2 py-1.5 text-right text-text-tertiary">{EMPTY}</td>;
  const tone = v >= 0.3 ? "text-success" : v >= 0.1 ? "text-text-primary" : "text-text-tertiary";
  return <td className={`px-2 py-1.5 text-right ${tone}`}>{pct(v)}</td>;
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
    { key: "new", label: "New addresses", value: last ? formatNumber(last.new, format, { maximumFractionDigits: 0 }) : "…", sub: last ? `${pct(last.active ? last.new / last.active : null)} of active` : undefined },
    { key: "ret", label: "Returning", value: last ? formatNumber(last.returning, format, { maximumFractionDigits: 0 }) : "…", sub: last?.day },
    {
      key: "top10",
      label: "Top 10 senders",
      value: c ? pct(c.top10Share) : "…",
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
            ) : (
              <table className="w-full mono text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                    <th className="text-left font-semibold px-3.5 py-2">Cohort</th>
                    <th className="text-right font-semibold px-2 py-2">New</th>
                    <th className="text-right font-semibold px-2 py-2">D+1</th>
                    <th className="text-right font-semibold px-3.5 py-2">D+7</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Newest cohorts first; empty cohorts (early days) carry no signal. */}
                  {[...data.retention].filter((r) => r.size > 0).sort((a, b) => b.cohortDay.localeCompare(a.cohortDay)).map((r) => (
                    <tr key={r.cohortDay} className="border-t border-border-subtle">
                      <td className="px-3.5 py-1.5 text-text-secondary">{r.cohortDay}</td>
                      <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(r.size)}</td>
                      <RetentionCell v={r.d1} />
                      <RetentionCell v={r.d7} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHead
            title="Busiest senders"
            tag="last 24h, likely bots on top"
          />
          <RowFillList className="px-3.5 py-1" mobileHeight="h-[360px]">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <tbody>
                  {data.topSenders24h.map((s) => (
                    <tr key={s.address} className="border-t border-border-subtle first:border-t-0">
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        <AddrLink address={s.address} className="text-text-secondary" />
                      </td>
                      <td className="py-1.5 pr-2 text-right text-text-primary whitespace-nowrap">{compactCount(s.txs)} tx</td>
                      <td className="py-1.5 pr-2 text-right text-text-tertiary whitespace-nowrap">{pct(s.share, 1)}</td>
                      <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap" title="Distinct contracts or addresses it sent to">
                        {compactCount(s.distinctTargets)} target{s.distinctTargets === 1 ? "" : "s"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
