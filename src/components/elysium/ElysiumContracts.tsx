"use client";

import { memo, useState } from "react";
import { Boxes, Flame, Hammer, Rocket, SquareFunction } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHeading, KpiRibbon, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { elysiumTimeMs, useElysiumContracts, useElysiumDeployments, useElysiumMethods, type ElysiumContractKind } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, ago, completeDays, delta, pct, short, useNow } from "./shared";

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
                <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Kind</th>
                <th className="text-right font-semibold px-2 py-2">Txs</th>
                <th className="text-right font-semibold px-2 py-2 whitespace-nowrap hidden sm:table-cell">vs prev.</th>
                <th className="text-right font-semibold px-2 py-2">Callers</th>
                <th className="text-left font-semibold px-2 py-2 hidden md:table-cell">Top methods</th>
                <th className="text-left font-semibold px-3.5 py-2 hidden xl:table-cell">Deployed by</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = delta(r.txs, r.txsPrev);
                return (
                  <tr key={r.address} className="border-t border-border-subtle">
                    <td className="px-3.5 py-1.5 whitespace-nowrap">
                      <AddrLink address={r.address} className="text-text-primary">
                        {r.label || r.symbol || short(r.address)}
                      </AddrLink>
                      {(r.label || r.symbol) && <span className="text-text-tertiary hidden sm:inline"> {short(r.address)}</span>}
                    </td>
                    <td className="px-2 py-1.5 hidden sm:table-cell">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_TONE[r.kind]}`}>{r.kind}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(r.txs)}</td>
                    <td className={`px-2 py-1.5 text-right hidden sm:table-cell ${d ? (d.up ? "text-success" : "text-danger") : "text-text-tertiary"}`}>{d?.text ?? EMPTY}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary">{compactCount(r.callers)}</td>
                    <td className="px-2 py-1.5 hidden md:table-cell max-w-[220px]">
                      <div className="truncate text-text-secondary">
                        {(r.topMethods ?? []).length === 0
                          ? EMPTY
                          : (r.topMethods ?? []).map((m, i) => (
                              <span key={`${m.methodId}-${i}`} title={m.signature ?? m.methodId}>
                                {i > 0 && <span className="text-text-tertiary">, </span>}
                                <span className={m.name ? "" : "text-text-tertiary"}>{m.name ?? (m.methodId || "transfer")}</span>
                              </span>
                            ))}
                      </div>
                    </td>
                    <td className="px-3.5 py-1.5 whitespace-nowrap hidden xl:table-cell">
                      {r.deployer ? (
                        <AddrLink address={r.deployer} className="text-text-tertiary" />
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

const TopMethods = memo(function TopMethods() {
  const [window, setWindow] = useState<"24h" | "7d">("24h");
  const { data, error } = useElysiumMethods(window);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<SquareFunction size={13} className="text-brand" />}
        title="Most called methods"
        meta={data ? `names for ${data.resolver.found} of the ${data.resolver.lookedUp} most used selectors` : "spam excluded"}
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
        {!data ? (
          <Empty>{error ? "Analytics are unavailable right now." : "Loading methods…"}</Empty>
        ) : data.rows.length === 0 ? (
          <Empty>No contract call indexed yet.</Empty>
        ) : (
          <>
            <table className="w-full mono text-[12px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                  <th className="text-left font-semibold px-3.5 py-2">Method</th>
                  <th className="text-right font-semibold px-2 py-2">Calls</th>
                  <th className="text-right font-semibold px-2 py-2">Share</th>
                  <th className="text-right font-semibold px-2 py-2 hidden sm:table-cell">Senders</th>
                  <th className="text-right font-semibold px-3.5 py-2 hidden sm:table-cell">Contracts</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((m) => (
                  <tr key={m.methodId} className="border-t border-border-subtle">
                    <td className="px-3.5 py-1.5 max-w-[320px]">
                      <div className="truncate" title={m.signature ?? undefined}>
                        {m.name ? <span className="text-text-primary">{m.name}</span> : <span className="text-text-tertiary">unknown</span>}
                        <span className="text-text-tertiary hidden sm:inline"> {m.methodId}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(m.txs)}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary">{pct(m.share, 1)}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary hidden sm:table-cell">{compactCount(m.senders)}</td>
                    <td className="px-3.5 py-1.5 text-right text-text-tertiary hidden sm:table-cell">{compactCount(m.contracts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3.5 py-2 text-[11px] text-text-tertiary border-t border-border-subtle">
              Share of {compactCount(data.totals.calls)} contract calls. Not counted above: {compactCount(data.totals.plainTransfers)} plain HYPE
              transfers and {compactCount(data.totals.contractCreations)} contract creations.
            </div>
          </>
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
                        <AddrLink address={c.address} className="text-text-primary">{c.symbol || short(c.address)}</AddrLink>
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
                        <AddrLink address={d.address} className="text-text-secondary" />
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
      <TopMethods />
      <p className="text-[11px] text-text-tertiary flex items-center gap-1.5">
        <Boxes size={12} /> Precompiles are Arbitrum system contracts (withdrawals, retryable tickets…). Testnet deployments include load tests. Method names come
        from a public signature database; a selector can collide with other signatures, so treat names as best effort.
      </p>
    </div>
  );
}
