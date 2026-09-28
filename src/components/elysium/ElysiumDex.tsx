"use client";

import { memo } from "react";
import { ArrowLeftRight, Factory, Info, Sparkles, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, KpiRibbon, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { elysiumTimeMs, useElysiumDex, type ElysiumDexPoolRef } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, ago, completeDays, short, useNow } from "./shared";

/** Token label: symbol when the provider knows one, else the short address. */
function TokenLabel({ address, symbol }: { address: string | null; symbol: string | null }) {
  if (!address) return <span className="text-text-tertiary">?</span>;
  return (
    <AddrLink address={address} explorer={false} className={symbol ? "text-text-primary" : "text-text-tertiary"}>
      {symbol || short(address)}
    </AddrLink>
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
        icon={<ArrowLeftRight size={13} className="text-brand" />}
        rows={days}
        loading={isLoading}
        defs={[
          { id: "swaps", name: "Swaps", color: chartPalette.accent, axis: "left", pick: (r) => r.swaps, format: (v) => compactCount(v) },
          { id: "active", name: "Active pools", color: chartPalette.gold, axis: "right", pick: (r) => r.activePools, format: (v) => compactCount(v) },
          { id: "created", name: "Pools created", color: chartPalette.success, axis: "right", pick: (r) => r.poolsCreated, format: (v) => compactCount(v) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<Trophy size={13} className="text-brand" />} title="Most traded pools" meta="swaps, last 24h" metaVariant="plain" />
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
                    <th className={`${TH} text-left px-2`}>Type</th>
                    <th className={`${TH} text-right px-2`}>Swaps</th>
                    <th className={`${TH} text-right px-3.5`}>Traders</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPools24h.map((p) => (
                    <tr key={p.pool} className="border-t border-border-subtle">
                      <td className="px-3.5 py-1.5">
                        <PairLabel p={p} />
                        <div className="text-[10px]">
                          <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                        </div>
                      </td>
                      <td className="px-2 py-1.5"><VersionTag version={p.version} fee={p.fee} /></td>
                      <td className="px-2 py-1.5 text-right text-text-primary">{compactCount(p.swaps24h)}</td>
                      <td className="px-3.5 py-1.5 text-right text-text-secondary">{compactCount(p.traders24h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<Sparkles size={13} className="text-brand" />} title="Newest pools" meta="latest 15 created" metaVariant="plain" />
          <div className="overflow-x-auto">
            {!data ? (
              <Empty>{unavailable}</Empty>
            ) : data.newPools.length === 0 ? (
              <Empty>No pool created yet.</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <thead>
                  <tr>
                    <th className={`${TH} text-left px-3.5`}>Pair</th>
                    <th className={`${TH} text-left px-2`}>Type</th>
                    <th className={`${TH} text-right px-2`}>Created</th>
                    <th className={`${TH} text-right px-3.5`}>Swaps 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {data.newPools.map((p) => (
                    <tr key={p.pool} className="border-t border-border-subtle">
                      <td className="px-3.5 py-1.5">
                        <PairLabel p={p} />
                        <div className="text-[10px]">
                          <AddrLink address={p.pool} className="text-text-tertiary">pool {short(p.pool)}</AddrLink>
                        </div>
                      </td>
                      <td className="px-2 py-1.5"><VersionTag version={p.version} fee={p.fee} /></td>
                      <td className="px-2 py-1.5 text-right text-text-tertiary whitespace-nowrap">{ago(elysiumTimeMs(p.createdAt), now)} ago</td>
                      <td className={`px-3.5 py-1.5 text-right ${p.swaps24h ? "text-text-primary" : "text-text-tertiary"}`}>{compactCount(p.swaps24h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHeading icon={<Factory size={13} className="text-brand" />} title="Factories" meta="contracts emitting pool-creation events" metaVariant="plain" />
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
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Info size={12} className="mt-px shrink-0" />
        Testnet data. Counts come from Uniswap V2 PairCreated / Swap and V3 PoolCreated / Swap event logs; forks that emit other events are not
        included. Test tokens have no price, so no volume in dollars is shown.
      </p>
    </div>
  );
});
