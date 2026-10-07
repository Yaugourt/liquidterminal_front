"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, RowFillList, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumBridgeAnalytics } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, completeDays, duration } from "./shared";

/**
 * Elysium · Bridge: daily HYPE flows in and out, per-token volumes, real
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
              <table className="w-full mono text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                    <th className="text-left font-semibold px-3.5 py-2">Token</th>
                    <th className="text-right font-semibold px-2 py-2">In</th>
                    <th className="text-right font-semibold px-2 py-2">Out</th>
                    <th className="text-right font-semibold px-3.5 py-2">Transfers</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Rows without a symbol carry raw, unscaled amounts upstream: not comparable, left out. */}
                  {data.tokens.filter((t) => t.symbol).map((t) => (
                    <tr key={`${t.route}-${t.symbol}`} className="border-t border-border-subtle">
                      <td className="px-3.5 py-1.5 whitespace-nowrap">
                        <span className="text-text-primary">{t.symbol || EMPTY}</span> <span className="text-[10px] text-text-tertiary hidden sm:inline">{t.route}</span>
                      </td>
                      <td className="px-2 py-1.5 text-right text-success">{compactCount(t.amountIn)}</td>
                      <td className="px-2 py-1.5 text-right text-danger">{compactCount(t.amountOut)}</td>
                      <td className="px-3.5 py-1.5 text-right text-text-secondary">{compactCount(t.deposits + t.withdrawals)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHead title="Most active bridgers" tag="last 14 days, by transfers, HYPE amounts" />
          <RowFillList className="px-3.5 py-1" mobileHeight="h-[360px]">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <tbody>
                  {data.topBridgers.map((b) => (
                    <tr key={b.address} className="border-t border-border-subtle first:border-t-0">
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        <AddrLink address={b.address} className="text-text-secondary" />
                      </td>
                      <td className="py-1.5 pr-2 text-right text-success whitespace-nowrap">+{n(b.hypeIn)}</td>
                      <td className="py-1.5 pr-2 text-right text-danger whitespace-nowrap">-{n(b.hypeOut)}</td>
                      <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap">{compactCount(b.transfers)} transfers</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
