"use client";

import { memo, useState } from "react";
import { Boxes, Flame, Hammer, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHeading, KpiRibbon, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { elysiumTimeMs, useElysiumContracts, useElysiumDeployments, type ElysiumContractKind } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { EMPTY, EXPLORER, Empty, ExtLink, ago, completeDays, delta, short, useNow } from "./shared";

const KIND_TONE: Record<ElysiumContractKind, string> = {
  precompile: "bg-surface-2 text-text-tertiary",
  token: "bg-gold/10 text-gold",
  contract: "bg-brand/10 text-brand",
};

const TopContracts = memo(function TopContracts() {
  const [window, setWindow] = useState<"24h" | "7d">("24h");
  const { data: rows, error } = useElysiumContracts(window);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<Flame size={13} className="text-brand" />}
        title="Most used contracts"
        meta="by transactions, spam excluded"
        metaVariant="plain"
        actions={
          <PillTabs
            tabs={[{ value: "24h", label: "24h" }, { value: "7d", label: "7d" }]}
            activeTab={window}
            onTabChange={(v) => setWindow(v as "24h" | "7d")}
          />
        }
      />
      <div className="overflow-x-auto">
        {!rows ? (
          <Empty>{error ? "Analytics are unavailable right now." : "Loading contracts…"}</Empty>
        ) : rows.length === 0 ? (
          <Empty>No contract activity indexed yet.</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                <th className="text-left font-semibold px-3.5 py-2">Contract</th>
                <th className="text-left font-semibold px-2 py-2">Kind</th>
                <th className="text-right font-semibold px-2 py-2">Txs</th>
                <th className="text-right font-semibold px-2 py-2">vs prev.</th>
                <th className="text-right font-semibold px-2 py-2">Callers</th>
                <th className="text-left font-semibold px-3.5 py-2 hidden lg:table-cell">Deployed by</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = delta(r.txs, r.txsPrev);
                return (
                  <tr key={r.address} className="border-t border-border-subtle">
                    <td className="px-3.5 py-1.5 whitespace-nowrap">
                      <ExtLink href={`${EXPLORER}/address/${r.address}`} className="text-text-primary">
                        {r.label || r.symbol || short(r.address)}
                      </ExtLink>
                      {(r.label || r.symbol) && <span className="text-text-tertiary"> {short(r.address)}</span>}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_TONE[r.kind]}`}>{r.kind}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(r.txs)}</td>
                    <td className={`px-2 py-1.5 text-right ${d ? (d.up ? "text-success" : "text-danger") : "text-text-tertiary"}`}>{d?.text ?? EMPTY}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary">{compactCount(r.callers)}</td>
                    <td className="px-3.5 py-1.5 whitespace-nowrap hidden lg:table-cell">
                      {r.deployer ? (
                        <ExtLink href={`${EXPLORER}/address/${r.deployer}`} className="text-text-tertiary">{short(r.deployer)}</ExtLink>
                      ) : (
                        <span className="text-text-tertiary">{r.kind === "precompile" ? "system" : EMPTY}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

/**
 * Elysium · Contracts: what gets deployed, by whom, and what actually gets
 * used. Computed by our backend from every indexed transaction.
 */
export function ElysiumContracts() {
  const { format } = useNumberFormat();
  const { data, isLoading, error } = useElysiumDeployments(14);
  const now = useNow(30_000);
  const days = completeDays(data?.daily);
  const last = days[days.length - 1];
  const today = data?.daily.find((d) => d.partial);

  const cells: KpiCell[] = [
    { key: "dep", label: "Deployments", value: last ? formatNumber(last.deployments, format, { maximumFractionDigits: 0 }) : "…", sub: last?.day },
    { key: "deployers", label: "Deployers", value: last ? formatNumber(last.deployers, format, { maximumFractionDigits: 0 }) : "…", sub: last?.day },
    {
      key: "per",
      label: "Per deployer",
      value: last && last.deployers ? (last.deployments / last.deployers).toFixed(1) : "…",
      sub: "deployments each",
    },
    { key: "today", label: "Today so far", value: today ? formatNumber(today.deployments, format, { maximumFractionDigits: 0 }) : "…", sub: "UTC, partial" },
  ];

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <DailyChartCard
        title="Deployments per day"
        icon={<Rocket size={13} className="text-brand" />}
        rows={days}
        loading={isLoading}
        defs={[
          { id: "dep", name: "Contracts deployed", color: chartPalette.accent, axis: "left", pick: (r) => r.deployments, format: (v) => compactCount(v) },
          { id: "who", name: "Distinct deployers", color: chartPalette.gold, axis: "right", pick: (r) => r.deployers, format: (v) => compactCount(v) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHeading
            icon={<Rocket size={13} className="text-brand" />}
            title="New contracts gaining users"
            meta="deployed in the last 24h"
            metaVariant="plain"
          />
          <div className="px-3.5 py-1">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : data.trending.length === 0 ? (
              <Empty>No new contract has callers yet.</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <tbody>
                  {data.trending.map((c) => (
                    <tr key={c.address} className="border-t border-border-subtle first:border-t-0">
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        <ExtLink href={`${EXPLORER}/address/${c.address}`} className="text-text-primary">{c.symbol || short(c.address)}</ExtLink>
                      </td>
                      <td className="py-1.5 pr-2 text-right text-text-primary whitespace-nowrap">{compactCount(c.callers24h)} callers</td>
                      <td className="py-1.5 pr-2 text-right text-text-tertiary whitespace-nowrap">{compactCount(c.txs24h)} tx</td>
                      <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap">{ago(elysiumTimeMs(c.deployedAt), now)} old</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<Hammer size={13} className="text-brand" />} title="Top deployers" meta="last 7 days" metaVariant="plain" />
          <div className="px-3.5 py-1">
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <tbody>
                  {data.topDeployers.map((d) => (
                    <tr key={d.address} className="border-t border-border-subtle first:border-t-0">
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        <ExtLink href={`${EXPLORER}/address/${d.address}`} className="text-text-secondary">{short(d.address)}</ExtLink>
                      </td>
                      <td className="py-1.5 pr-2 text-right text-text-primary whitespace-nowrap">{compactCount(d.deployments)} contracts</td>
                      <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap">last {ago(elysiumTimeMs(d.lastDeploy), now)} ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
      <TopContracts />
      <p className="text-[11px] text-text-tertiary flex items-center gap-1.5">
        <Boxes size={12} /> Precompiles are Arbitrum system contracts (withdrawals, retryable tickets…). Testnet deployments include load tests.
      </p>
    </div>
  );
}
