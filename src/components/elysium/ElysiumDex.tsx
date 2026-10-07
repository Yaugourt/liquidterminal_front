"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, RowFillList, chartPalette, type KpiCell } from "@/components/common";
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

const TH = "text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold py-2";

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
          the newest pools on the right, so neither side leaves a hole. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Most traded pools" tag="swaps, last 24h" />
            <div className="overflow-x-auto">
              {!data ? (
                <Empty>{unavailable}</Empty>
              ) : data.topPools24h.length === 0 ? (
                <Empty>No swap in the last 24h.</Empty>
              ) : (
                <table className="w-full mono text-[12px]">
                  <thead>
                    <tr>
                      <th className={`${TH} text-left px-3.5`}>Pair</th>
                      <th className={`${TH} text-left px-2 hidden xl:table-cell`}>Type</th>
                      <th className={`${TH} text-right px-2`}>Swaps</th>
                      <th className={`${TH} text-right px-3.5 hidden sm:table-cell`}>Traders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPools24h.map((p) => (
                      <tr key={p.pool} className="border-t border-border-subtle">
                        <td className="px-3.5 py-1.5">
                          <PairLabel p={p} />
                          <div className="text-[10px]">
                            <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                          <span className="xl:hidden text-text-tertiary"> · {p.version.toUpperCase()}{p.fee != null ? ` ${(p.fee / 10_000).toFixed(2)}%` : ""}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 hidden xl:table-cell"><VersionTag version={p.version} fee={p.fee} /></td>
                        <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(p.swaps24h)}</td>
                        <td className="px-3.5 py-1.5 text-right text-text-secondary hidden sm:table-cell">{compactCount(p.traders24h)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <table className="w-full mono text-[12px]">
                  <thead>
                    <tr>
                      <th className={`${TH} text-left px-3.5`}>Factory</th>
                      <th className={`${TH} text-left px-2`}>Type</th>
                      <th className={`${TH} text-right px-2`}>Pools</th>
                      <th className={`${TH} text-right px-2`}>Swaps 24h</th>
                      <th className={`${TH} text-right px-3.5 hidden sm:table-cell`}>Last pool</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.factories.map((f) => (
                      <tr key={f.address} className="border-t border-border-subtle">
                        <td className="px-3.5 py-1.5 whitespace-nowrap"><AddrLink address={f.address} className="text-text-primary" /></td>
                        <td className="px-2 py-1.5 text-text-secondary">{f.versions.map((v) => v.toUpperCase()).join(" + ")}</td>
                        <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(f.pools)}</td>
                        <td className="px-2 py-1.5 text-right text-text-secondary">{compactCount(f.swaps24h)}</td>
                        <td className="px-3.5 py-1.5 text-right text-text-tertiary whitespace-nowrap hidden sm:table-cell">
                          {f.lastPoolAt ? `${ago(elysiumTimeMs(f.lastPoolAt), now)} ago` : EMPTY}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
        <div className="min-w-0 flex flex-col">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHead title="Newest pools" tag="newest first" />
            {/* Fills the height of the left column with as many recent pools as fit. */}
            <RowFillList mobileHeight="h-[420px]">
              {!data ? (
                <Empty>{unavailable}</Empty>
              ) : data.newPools.length === 0 ? (
                <Empty>No pool created yet.</Empty>
              ) : (
                <table className="w-full mono text-[12px]">
                  <thead>
                    <tr>
                      <th className={`${TH} text-left px-3.5`}>Pair</th>
                      <th className={`${TH} text-left px-2 hidden xl:table-cell`}>Type</th>
                      <th className={`${TH} text-right px-2`}>Created</th>
                      <th className={`${TH} text-right px-3.5 hidden sm:table-cell`}>Swaps 24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.newPools.map((p) => (
                      <tr key={p.pool} className="border-t border-border-subtle">
                        <td className="px-3.5 py-1.5">
                          <PairLabel p={p} />
                          <div className="text-[10px]">
                            <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                          <span className="xl:hidden text-text-tertiary"> · {p.version.toUpperCase()}{p.fee != null ? ` ${(p.fee / 10_000).toFixed(2)}%` : ""}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 hidden xl:table-cell"><VersionTag version={p.version} fee={p.fee} /></td>
                        <td className="px-2 py-1.5 text-right text-text-tertiary whitespace-nowrap">{ago(elysiumTimeMs(p.createdAt), now)} ago</td>
                        <td className={`px-3.5 py-1.5 text-right hidden sm:table-cell ${p.swaps24h ? "text-text-primary" : "text-text-tertiary"}`}>{compactCount(p.swaps24h)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
