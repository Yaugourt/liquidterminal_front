"use client";

import { memo, useState } from "react";
import { Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, chartPalette, type KpiCell } from "@/components/common";
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
      <CardHead
        title="Most used contracts"
        tag="by transactions, spam excluded"
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
          <ModuleTable
            columns={[
              // No width on Contract and Top methods: they share the room left and truncate (titles carry the text).
              { header: "Contract" },
              { header: "Kind", width: 100, align: "left", className: "hidden sm:table-cell" },
              { header: "Txs", width: 80 },
              { header: "vs prev.", width: 84, className: "hidden sm:table-cell" },
              { header: "Callers", width: 80 },
              { header: "Top methods", align: "left", className: "hidden md:table-cell" },
              { header: "Deployed by", width: 132, align: "left", className: "hidden xl:table-cell" },
            ]}
          >
            {rows.map((r) => {
              const d = delta(r.txs, r.txsPrev);
              return (
                <ModuleTableRow
                  key={r.address}
                  cells={[
                    <span key="c" className="mono block truncate" title={r.label || r.symbol ? `${r.label || r.symbol} ${r.address}` : r.address}>
                      <AddrLink address={r.address} className="text-text-primary">
                        {r.label || r.symbol || short(r.address)}
                      </AddrLink>
                      {(r.label || r.symbol) && <span className="text-text-tertiary hidden sm:inline"> {short(r.address)}</span>}
                    </span>,
                    <span key="k" className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_TONE[r.kind]}`}>{r.kind}</span>,
                    <span key="t" className="mono text-text-primary">{compactCount(r.txs)}</span>,
                    <span key="d" className={`mono ${d ? (d.up ? "text-success" : "text-danger") : "text-text-tertiary"}`}>{d?.text ?? EMPTY}</span>,
                    <span key="cl" className="mono text-text-secondary">{compactCount(r.callers)}</span>,
                    <div
                      key="m"
                      className="mono truncate text-text-secondary"
                      title={(r.topMethods ?? []).map((m) => m.name ?? (m.methodId || "transfer")).join(", ") || undefined}
                    >
                      {(r.topMethods ?? []).length === 0
                        ? EMPTY
                        : (r.topMethods ?? []).map((m, i) => (
                            <span key={`${m.methodId}-${i}`} title={m.signature ?? m.methodId}>
                              {i > 0 && <span className="text-text-tertiary">, </span>}
                              <span className={m.name ? "" : "text-text-tertiary"}>{m.name ?? (m.methodId || "transfer")}</span>
                            </span>
                          ))}
                    </div>,
                    <span key="dep" className="mono whitespace-nowrap">
                      {r.deployer ? (
                        <AddrLink address={r.deployer} className="text-text-tertiary" />
                      ) : (
                        <span className="text-text-tertiary">{r.kind === "precompile" ? "system" : EMPTY}</span>
                      )}
                    </span>,
                  ]}
                />
              );
            })}
          </ModuleTable>
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
      <CardHead
        title="Most called methods"
        tag={data ? `names for ${data.resolver.found} of the ${data.resolver.lookedUp} most used selectors` : "spam excluded"}
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
            <ModuleTable
              columns={[
                { header: "Method" },
                { header: "Calls", width: 76 },
                { header: "Share", width: 76 },
                { header: "Senders", width: 78, className: "hidden sm:table-cell" },
                { header: "Contracts", width: 92, className: "hidden sm:table-cell" },
              ]}
            >
              {data.rows.map((m) => (
                <ModuleTableRow
                  key={m.methodId}
                  cells={[
                    <div key="m" className="mono truncate" title={m.signature ?? `${m.name ?? "unknown"} ${m.methodId}`}>
                      {m.name ? <span className="text-text-primary">{m.name}</span> : <span className="text-text-tertiary">unknown</span>}
                      <span className="text-text-tertiary hidden sm:inline"> {m.methodId}</span>
                    </div>,
                    <span key="c" className="mono text-text-primary">{compactCount(m.txs)}</span>,
                    <span key="s" className="mono text-text-secondary">{pct(m.share, 1)}</span>,
                    <span key="se" className="mono text-text-secondary">{compactCount(m.senders)}</span>,
                    <span key="co" className="mono text-text-tertiary">{compactCount(m.contracts)}</span>,
                  ]}
                />
              ))}
            </ModuleTable>
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
        rows={days}
        loading={isLoading}
        defs={[
          { id: "dep", name: "Contracts deployed", color: chartPalette.accent, axis: "left", pick: (r) => r.deployments, format: (v) => compactCount(v) },
          { id: "who", name: "Distinct deployers", color: chartPalette.gold, axis: "right", pick: (r) => r.deployers, format: (v) => compactCount(v) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHead
            title="New contracts gaining users"
            tag="deployed in the last 24h"
          />
          <div>
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : data.trending.length === 0 ? (
              <Empty>No new contract has callers yet.</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  // Counts up to "123.4K" / "12.35M"; Age stays under "24h" (deployed in the last 24h).
                  { header: "Contract" },
                  { header: "Callers", width: 72 },
                  { header: "Txs", width: 72 },
                  { header: "Age", width: 52 },
                ]}
              >
                {data.trending.map((c) => (
                  <ModuleTableRow
                    key={c.address}
                    cells={[
                      <span key="c" className="mono block truncate" title={c.symbol ? `${c.symbol} ${c.address}` : c.address}>
                        <AddrLink address={c.address} className="text-text-primary">{c.symbol || short(c.address)}</AddrLink>
                      </span>,
                      <span key="ca" className="mono whitespace-nowrap text-text-primary">{compactCount(c.callers24h)}</span>,
                      <span key="tx" className="mono whitespace-nowrap text-text-tertiary">{compactCount(c.txs24h)}</span>,
                      <span key="age" className="mono whitespace-nowrap text-text-tertiary">{ago(elysiumTimeMs(c.deployedAt), now)}</span>,
                    ]}
                  />
                ))}
              </ModuleTable>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Top deployers" tag="last 7 days" />
          <div>
            {!data ? (
              <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
            ) : (
              <ModuleTable
                density="compact"
                columns={[
                  { header: "Deployer" },
                  { header: "Contracts", width: 89 },
                  { header: "Last deploy", width: 103 },
                ]}
              >
                {data.topDeployers.map((d) => (
                  <ModuleTableRow
                    key={d.address}
                    cells={[
                      <span key="a" className="mono whitespace-nowrap">
                        <AddrLink address={d.address} className="text-text-secondary" />
                      </span>,
                      <span key="n" className="mono whitespace-nowrap text-text-primary">{compactCount(d.deployments)}</span>,
                      <span key="l" className="mono whitespace-nowrap text-text-tertiary">{ago(elysiumTimeMs(d.lastDeploy), now)} ago</span>,
                    ]}
                  />
                ))}
              </ModuleTable>
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
