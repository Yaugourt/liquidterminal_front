"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, RowFillList, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { elysiumTimeMs, useElysiumDex, type ElysiumDexPoolRef } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, ago, completeDays, short, useNow } from "./shared";

/** Token label: symbol when the provider knows one, else the short address. */
function TokenLabel({ address, symbol }: { address: string | null; symbol: string | null }) {
  if (!address) return <span className="text-text-tertiary">?</span>;
  return (
    // Test tokens can carry very long symbols: cap them so the pair column fits half a page.
    <span className="inline-block max-w-[6rem] truncate align-bottom" title={symbol ?? address}>
      <AddrLink address={address} explorer={false} className={symbol ? "text-text-primary" : "text-text-tertiary"}>
        {symbol || short(address)}
      </AddrLink>
    </span>
  );
}

function PairLabel({ p }: { p: ElysiumDexPoolRef }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <TokenLabel address={p.token0} symbol={p.token0Symbol} />
      <span className="text-text-tertiary">/</span>
      <TokenLabel address={p.token1} symbol={p.token1Symbol} />
    </span>
  );
}

function VersionTag({ version, fee }: { version: string; fee: number | null }) {
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary whitespace-nowrap">
      {version.toUpperCase()}
      {fee != null ? ` ${(fee / 10_000).toFixed(2)}%` : ""}
    </span>
  );
}

/**
 * Elysium · DEX: Uniswap V2 / V3 style pools and swaps, decoded by our backend
 * from PairCreated / PoolCreated / Swap event logs.
 */
export const ElysiumDex = memo(function ElysiumDex() {
  const { format } = useNumberFormat();
  const { data, isLoading, error } = useElysiumDex(14);
  const now = useNow(30_000);
  const days = completeDays(data?.daily);
  const t = data?.totals;
  const n = (v: number | undefined) => (v == null ? "…" : formatNumber(v, format, { maximumFractionDigits: 0 }));

  const cells: KpiCell[] = [
    { key: "pools", label: "Pools", value: n(t?.pools), sub: "created since genesis" },
    { key: "pools24", label: "New pools", value: n(t?.pools24h), sub: "last 24h" },
    { key: "swaps24", label: "Swaps", value: n(t?.swaps24h), sub: "last 24h" },
    { key: "traders", label: "Traders", value: n(t?.traders24h), sub: "distinct tx senders, 24h" },
  ];

  const unavailable = error ? "Analytics are unavailable right now." : "Loading…";

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <DailyChartCard
        title="DEX activity per day"
        rows={days}
        loading={isLoading}
        defs={[
          { id: "swaps", name: "Swaps", color: chartPalette.accent, axis: "left", pick: (r) => r.swaps, format: (v) => compactCount(v) },
          { id: "active", name: "Active pools", color: chartPalette.gold, axis: "right", pick: (r) => r.activePools, format: (v) => compactCount(v) },
          { id: "created", name: "Pools created", color: chartPalette.success, axis: "right", pick: (r) => r.poolsCreated, format: (v) => compactCount(v) },
        ]}
      />
      {/* Two independent columns: the short 24h list and the factories stack on the left,
          the newest pools on the right, so neither side leaves a hole. Side by side from xl only:
          at lg a half-width card (352-362 px) cannot hold the pool pair (~216 px) beside its counts. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Most traded pools" tag="swaps, last 24h" />
            <div className="overflow-x-auto">
              {!data ? (
                <Empty>{unavailable}</Empty>
              ) : data.topPools24h.length === 0 ? (
                <Empty>No swap in the last 24h.</Empty>
              ) : (
                <ModuleTable
                  columns={[
                    { header: "Pair", align: "left" },
                    { header: "Type", width: 88, align: "left", className: "hidden xl:table-cell" },
                    { header: "Swaps", width: 80 },
                    { header: "Traders", width: 80, className: "hidden sm:table-cell" },
                  ]}
                >
                  {data.topPools24h.map((p) => (
                    <ModuleTableRow
                      key={p.pool}
                      cells={[
                        <div key="pair" className="mono">
                        <PairLabel p={p} />
                        <div className="text-[10px]">
                          <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                          <span className="xl:hidden text-text-tertiary"> · {p.version.toUpperCase()}{p.fee != null ? ` ${(p.fee / 10_000).toFixed(2)}%` : ""}</span>
                        </div>
                      </div>,
                        <span key="type" className="mono"><VersionTag version={p.version} fee={p.fee} /></span>,
                        <span key="swaps" className="mono text-text-primary">{compactCount(p.swaps24h)}</span>,
                        <span key="traders" className="mono text-text-secondary">{compactCount(p.traders24h)}</span>,
                      ]}
                    />
                  ))}
                </ModuleTable>
              )}
            </div>
          </Card>
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Factories" tag="contracts emitting pool-creation events" />
            <div className="overflow-x-auto">
              {!data ? (
                <Empty>{unavailable}</Empty>
              ) : data.factories.length === 0 ? (
                <Empty>No factory seen yet.</Empty>
              ) : (
                <ModuleTable
                  columns={[
                    { header: "Factory", align: "left" },
                    { header: "Type", width: 84, align: "left", className: "hidden sm:table-cell" },
                    { header: "Pools", width: 80 },
                    { header: "Swaps 24h", width: 92 },
                    { header: "Last pool", width: 92, className: "hidden sm:table-cell" },
                  ]}
                >
                  {data.factories.map((f) => (
                    <ModuleTableRow
                      key={f.address}
                      cells={[
                        <span key="factory" className="mono whitespace-nowrap"><AddrLink address={f.address} className="text-text-primary" /></span>,
                        <span key="type" className="mono text-text-secondary">{f.versions.map((v) => v.toUpperCase()).join(" + ")}</span>,
                        <span key="pools" className="mono text-text-primary">{compactCount(f.pools)}</span>,
                        <span key="swaps" className="mono text-text-secondary">{compactCount(f.swaps24h)}</span>,
                        <span key="last" className="mono text-text-tertiary whitespace-nowrap">
                          {f.lastPoolAt ? `${ago(elysiumTimeMs(f.lastPoolAt), now)} ago` : EMPTY}
                        </span>,
                      ]}
                    />
                  ))}
                </ModuleTable>
              )}
            </div>
          </Card>
        </div>
        <div className="min-w-0 flex flex-col">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHead title="Newest pools" tag="newest first" />
            {/* Fills the height of the left column with as many recent pools as fit. */}
            <RowFillList mobileHeight="h-[420px]" minHeight="lg:min-h-[420px] xl:min-h-[240px]">
              {!data ? (
                <Empty>{unavailable}</Empty>
              ) : data.newPools.length === 0 ? (
                <Empty>No pool created yet.</Empty>
              ) : (
                <ModuleTable
                  columns={[
                    { header: "Pair", align: "left" },
                    { header: "Type", width: 88, align: "left", className: "hidden xl:table-cell" },
                    { header: "Created", width: 84 },
                    { header: "Swaps 24h", width: 92, className: "hidden sm:table-cell" },
                  ]}
                >
                  {data.newPools.map((p) => (
                    <ModuleTableRow
                      key={p.pool}
                      cells={[
                        <div key="pair" className="mono">
                        <PairLabel p={p} />
                        <div className="text-[10px]">
                          <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                          <span className="xl:hidden text-text-tertiary"> · {p.version.toUpperCase()}{p.fee != null ? ` ${(p.fee / 10_000).toFixed(2)}%` : ""}</span>
                        </div>
                      </div>,
                        <span key="type" className="mono"><VersionTag version={p.version} fee={p.fee} /></span>,
                        <span key="created" className="mono text-text-tertiary whitespace-nowrap">{ago(elysiumTimeMs(p.createdAt), now)} ago</span>,
                        <span key="swaps" className={`mono ${p.swaps24h ? "text-text-primary" : "text-text-tertiary"}`}>{compactCount(p.swaps24h)}</span>,
                      ]}
                    />
                  ))}
                </ModuleTable>
              )}
            </RowFillList>
          </Card>
        </div>
      </div>
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Info size={12} className="mt-px shrink-0" />
        Testnet data. Counts come from Uniswap V2 PairCreated / Swap and V3 PoolCreated / Swap event logs; forks that emit other events are not
        included. Test tokens have no price, so no volume in dollars is shown.
      </p>
    </div>
  );
});
