"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, RowFillList, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumBridgeAnalytics } from "@/services/elysium";
import { ElysiumBridgeTracker } from "./ElysiumBridgeTracker";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, completeDays, duration } from "./shared";

/**
 * Elysium · Bridge: a transfer tracker, daily HYPE flows in and out, per-token volumes, real
 * finality times and the biggest bridgers. Computed by our backend from every
 * indexed bridge transfer. Amounts are token units (testnet, no prices).
 */
export function ElysiumBridgeAnalyticsView() {
  const { format } = useNumberFormat();
  const { data, isLoading, error } = useElysiumBridgeAnalytics(14);
  const days = completeDays(data?.daily);
  const last = days[days.length - 1];
  const dep = data?.finality.find((f) => f.direction === "deposit");
  const wd = data?.finality.find((f) => f.direction === "withdrawal");
  const n = (v: number) => formatNumber(v, format, { maximumFractionDigits: v < 10 ? 2 : 0 });

  const cells: KpiCell[] = [
    {
      key: "net",
      label: "Net HYPE flow",
      value: last ? `${last.netHype >= 0 ? "+" : ""}${n(last.netHype)}` : "…",
      tone: last ? (last.netHype >= 0 ? "success" : "danger") : undefined,
      sub: last ? `${last.day}, into Elysium` : undefined,
    },
    { key: "in", label: "HYPE in", value: last ? n(last.hypeIn) : "…", sub: last ? `${compactCount(last.deposits)} deposits` : undefined },
    { key: "out", label: "HYPE out", value: last ? n(last.hypeOut) : "…", sub: last ? `${compactCount(last.withdrawals)} withdrawals` : undefined },
    { key: "dep", label: "Deposit time", value: dep ? duration(dep.medianS) : "…", sub: dep ? `median, p90 ${duration(dep.p90S)}` : undefined },
    { key: "wd", label: "Withdrawal time", value: wd ? duration(wd.medianS) : "…", sub: wd ? `median, p90 ${duration(wd.p90S)}` : undefined },
  ];

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1" />
      <ElysiumBridgeTracker dep={dep} wd={wd} />
      <DailyChartCard
        title="HYPE bridged per day"
        rows={days}
        loading={isLoading}
        defs={[
          { id: "in", name: "In (deposits)", color: chartPalette.success, axis: "left", pick: (r) => r.hypeIn, format: (v) => compactCount(v) },
          { id: "out", name: "Out (withdrawals)", color: chartPalette.danger, axis: "left", pick: (r) => r.hypeOut, format: (v) => compactCount(v) },
        ]}
      />
      {/* Stretch: the per-token table sets the height, the bridgers list fills it. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="By token" tag="last 14 days" />
          <div className="overflow-x-auto">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  // Transfers needs room that phones and lg's half-width cards do not have.
                  { header: "Token" },
                  { header: "In", width: 99 },
                  { header: "Out", width: 99 },
                  { header: "Transfers", width: 92, className: "hidden sm:table-cell lg:hidden xl:table-cell" },
                ]}
              >
                {/* Rows without a symbol carry raw, unscaled amounts upstream: not comparable, left out. */}
                {data.tokens.filter((t) => t.symbol).map((t) => (
                  <ModuleTableRow
                    key={`${t.route}-${t.symbol}`}
                    cells={[
                      <span key="t" className="mono block truncate" title={`${t.symbol} ${t.route}`}>
                        <span className="text-text-primary">{t.symbol || EMPTY}</span> <span className="text-[10px] text-text-tertiary hidden sm:inline">{t.route}</span>
                      </span>,
                      <span key="in" className="mono text-success">{compactCount(t.amountIn)}</span>,
                      <span key="out" className="mono text-danger">{compactCount(t.amountOut)}</span>,
                      <span key="tr" className="mono text-text-secondary">{compactCount(t.deposits + t.withdrawals)}</span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </div>
        </Card>
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHead title="Most active bridgers" tag="last 14 days, by transfers, HYPE amounts" />
          <RowFillList mobileHeight="h-[360px]">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  // Transfers needs room that phones and lg's half-width cards do not have.
                  { header: "Address", width: 130 },
                  { header: "In", width: 91 },
                  { header: "Out", width: 91 },
                  { header: "Transfers", width: 92, className: "hidden sm:table-cell lg:hidden xl:table-cell" },
                ]}
              >
                {data.topBridgers.map((b) => (
                  <ModuleTableRow
                    key={b.address}
                    cells={[
                      <span key="a" className="mono whitespace-nowrap">
                        <AddrLink address={b.address} className="text-text-secondary" />
                      </span>,
                      <span key="in" className="mono whitespace-nowrap text-success">+{n(b.hypeIn)}</span>,
                      <span key="out" className="mono whitespace-nowrap text-danger">-{n(b.hypeOut)}</span>,
                      <span key="tr" className="mono whitespace-nowrap text-text-tertiary">{compactCount(b.transfers)}</span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </RowFillList>
        </Card>
      </div>
      <p className="text-[11px] text-text-tertiary flex items-center gap-1.5">
        <Clock size={12} /> Finality = time from initiation to completion on the other side, completed transfers only. Testnet withdrawals wait out a challenge period.
      </p>
    </div>
  );
}
