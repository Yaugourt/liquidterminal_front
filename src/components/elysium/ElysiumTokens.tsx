"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { elysiumTimeMs, useElysiumTokenLaunches, type ElysiumTokenLaunch } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, ago, completeDays, short, useNow } from "./shared";

const TH = "text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold py-2";

function TokenTable({ rows, now, empty }: { rows: ElysiumTokenLaunch[]; now: number; empty: string }) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <table className="w-full mono text-[12px] table-fixed">
      <thead>
        <tr>
          <th className={`${TH} text-left px-3.5`}>Token</th>
          <th className={`${TH} text-right px-2 w-[72px]`}>Transfers</th>
          <th className={`${TH} text-right px-2 w-[64px]`}>Holders</th>
          <th className={`${TH} text-right px-3.5 w-[64px]`}>Age</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.address} className="border-t border-border-subtle">
            <td className="px-3.5 py-1.5 min-w-0">
              <div className="flex items-baseline gap-1.5 min-w-0" title={t.symbol}>
                <AddrLink address={t.address} className="text-text-primary">{t.symbol}</AddrLink>
                {t.origin === "canonical" && (
                  <span className="text-[9px] font-semibold px-1 rounded bg-brand/10 text-brand shrink-0">bridged</span>
                )}
              </div>
              {/* Many test tokens share a symbol: the short address tells the contracts apart, and every row keeps the same height. */}
              <div className="text-[10px] text-text-tertiary truncate" title={t.name && t.name !== t.symbol ? `${t.name} · ${t.address}` : t.address}>
                {short(t.address)}
                {t.name && t.name !== t.symbol ? ` · ${t.name}` : ""}
              </div>
            </td>
            <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(t.transfers)}</td>
            <td className="px-2 py-1.5 text-right text-text-secondary">{t.holders == null ? EMPTY : compactCount(t.holders)}</td>
            <td className="px-3.5 py-1.5 text-right text-text-tertiary whitespace-nowrap">{t.firstSeen ? ago(elysiumTimeMs(t.firstSeen), now) : EMPTY}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Elysium · Tokens: ERC-20 launches by day and the most used tokens, from the
 * provider's token registry plus holder snapshots for the top tokens.
 */
export const ElysiumTokens = memo(function ElysiumTokens() {
  const { format } = useNumberFormat();
  const { data, isLoading, error } = useElysiumTokenLaunches(14);
  const now = useNow(30_000);
  const days = completeDays(data?.daily);
  const last = days[days.length - 1];
  const t = data?.totals;
  const n = (v: number | undefined) => (v == null ? "…" : formatNumber(v, format, { maximumFractionDigits: 0 }));

  const cells: KpiCell[] = [
    { key: "all", label: "ERC-20 tokens", value: n(t?.tokens), sub: t ? `${formatNumber(t.named, format, { maximumFractionDigits: 0 })} with a symbol` : undefined },
    { key: "24h", label: "Launched", value: n(t?.launched24h), sub: "last 24h" },
    { key: "named24h", label: "With a symbol", value: n(t?.named24h), sub: "launched, last 24h" },
    { key: "day", label: "Last full day", value: n(last?.launched), sub: last?.day },
  ];

  const unavailable = error ? "Analytics are unavailable right now." : "Loading…";

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <DailyChartCard
        title="Tokens launched per day"
        rows={days}
        loading={isLoading}
        defs={[
          { id: "launched", name: "All ERC-20", color: chartPalette.accent, axis: "left", pick: (r) => r.launched, format: (v) => compactCount(v) },
          { id: "named", name: "With a symbol", color: chartPalette.gold, axis: "left", pick: (r) => r.named, format: (v) => compactCount(v) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="New tokens" tag="first seen in the last 24h, by transfers" />
          <div className="overflow-x-auto">
            {!data ? <Empty>{unavailable}</Empty> : <TokenTable rows={data.newTokens24h} now={now} empty="No named token launched in the last 24h." />}
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Most transferred tokens" tag="since genesis" />
          <div className="overflow-x-auto">
            {!data ? <Empty>{unavailable}</Empty> : <TokenTable rows={data.topTokens} now={now} empty="No token indexed yet." />}
          </div>
        </Card>
      </div>
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Info size={12} className="mt-px shrink-0" />
        Testnet tokens, no market value. Tokens without a symbol are hidden from the lists (most are load-test contracts). Holder counts are
        refreshed every 15 minutes for the listed tokens only.
      </p>
    </div>
  );
});
