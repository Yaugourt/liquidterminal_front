"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  CardHead,
  ChartSkeleton,
  DataStatus,
  ElysiumMark,
  HypeMark,
  KpiRibbon,
  RowFillList,
  chartPalette,
  type KpiCell,
} from "@/components/common";
import { MultiSeriesAreaChart } from "@/components/dashboard/chart";
import type { MultiSeries } from "@/components/dashboard/chart/MultiSeriesAreaChart";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { AddrLink, EMPTY, EXPLORER, Empty, ExtLink, ago, duration, methodLabel, short, useNow } from "./shared";
import {
  elysiumTimeMs,
  useElysiumBatches,
  useElysiumBlocks,
  useElysiumBridgeTransfers,
  useElysiumBridgedTokens,
  useElysiumDaily,
  useElysiumHead,
  useElysiumReserves,
  useElysiumRetryables,
  useElysiumStats,
  useElysiumTokens,
  useElysiumTransactions,
  useElysiumMethods,
  type ElysiumBlock,
} from "@/services/elysium";

/** Blocks per second over the returned window, from block timestamps (1s resolution). */
function blocksPerSecond(blocks: ElysiumBlock[] | null | undefined): number | null {
  if (!blocks || blocks.length < 10) return null;
  const times = blocks.map((b) => elysiumTimeMs(b.block_time)).filter(Number.isFinite);
  const span = (Math.max(...times) - Math.min(...times)) / 1000;
  if (span < 5) return null;
  const heights = blocks.map((b) => b.block_number);
  return (Math.max(...heights) - Math.min(...heights)) / span;
}

// ── KPI ribbon ───────────────────────────────────────────────────────────────
const ElysiumKpis = memo(function ElysiumKpis() {
  const { format } = useNumberFormat();
  const { data: head } = useElysiumHead();
  const { data: stats } = useElysiumStats();
  const { data: daily } = useElysiumDaily(30);
  const { data: rateBlocks } = useElysiumBlocks(100);
  const { data: native } = useElysiumReserves("native");
  const { data: batches } = useElysiumBatches(1);

  const bps = blocksPerSecond(rateBlocks);
  // Newest day is still filling; the last complete day is the fair figure.
  const lastFullDay = daily && daily.length > 1 ? daily[1] : undefined;
  const hype = native?.[0];
  const batch = batches?.[0];

  const cells: KpiCell[] = [
    {
      key: "head",
      label: "Block",
      value: head != null ? formatNumber(head, format, { maximumFractionDigits: 0 }) : stats ? formatNumber(stats.last_block, format, { maximumFractionDigits: 0 }) : "…",
      sub: head != null ? "live, public RPC" : "indexed tip",
      href: head != null ? `${EXPLORER}/block/${head}` : undefined,
    },
    { key: "bps", label: "Blocks / s", value: bps != null ? bps.toFixed(1) : "…", sub: "last 100 blocks" },
    {
      key: "utx",
      label: "User tx",
      value: stats ? compactCount(stats.user_transactions) : "…",
      sub: stats ? `${compactCount(stats.total_transactions)} incl. system` : undefined,
    },
    {
      key: "active",
      label: "Active addr.",
      value: lastFullDay ? formatNumber(lastFullDay.active_addresses, format, { maximumFractionDigits: 0 }) : "…",
      sub: lastFullDay ? lastFullDay.day : undefined,
    },
    { key: "senders", label: "Senders", value: stats ? compactCount(stats.unique_senders) : "…", sub: "since genesis" },
    { key: "contracts", label: "Contracts", value: stats ? compactCount(stats.contracts_created) : "…", sub: "created" },
    {
      key: "bridged",
      label: "HYPE bridged",
      value: hype ? compactCount(hype.locked) : "…",
      sub: hype ? (hype.backed ? <span className="text-success">fully backed</span> : <span className="text-danger">under-backed</span>) : undefined,
    },
    {
      key: "batch",
      label: "Last batch",
      value: batch ? `#${batch.batch_number}` : stats ? `#${stats.last_batch_number}` : "…",
      sub: batch ? `settled ${duration(batch.posting_delay_s)} after its last block` : undefined,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-8" />;
});

// ── Daily activity ───────────────────────────────────────────────────────────
const ElysiumActivity = memo(function ElysiumActivity() {
  const { data: daily, isLoading } = useElysiumDaily(30);

  const series: MultiSeries[] = useMemo(() => {
    // Newest first from the API, and today is partial: chart complete days only.
    const rows = [...(daily ?? [])].slice(1).reverse();
    const pts = (pick: (d: (typeof rows)[number]) => number) =>
      rows.map((d) => ({ time: Date.parse(`${d.day}T00:00:00Z`), value: pick(d) })).filter((p) => Number.isFinite(p.time));
    return [
      { id: "user", name: "User transactions", color: chartPalette.accent, axis: "left", data: pts((d) => d.user_transactions), formatValue: (v) => compactCount(v) },
      { id: "active", name: "Active addresses", color: chartPalette.gold, axis: "right", data: pts((d) => d.active_addresses), formatValue: (v) => compactCount(v) },
    ];
  }, [daily]);

  const days = series[0].data.length;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Activity"
        tag={days ? `${days} complete days since genesis` : undefined}
      />
      <div className="p-3 h-[280px]">
        {isLoading && !daily ? (
          <ChartSkeleton minHeight="min-h-[250px]" />
        ) : days < 2 ? (
          <Empty>Not enough history yet.</Empty>
        ) : (
          <MultiSeriesAreaChart series={series} height={250} />
        )}
      </div>
    </Card>
  );
});

// ── Live lists ───────────────────────────────────────────────────────────────
const ElysiumTransactions = memo(function ElysiumTransactions() {
  const { data: txs, error } = useElysiumTransactions(14);
  // Selector -> signature map (our backend, top selectors only); hex stays when unknown.
  const { data: methods } = useElysiumMethods("24h");
  const names = methods?.names;
  const now = useNow(3_000);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Latest transactions"
        tag="spam and system hidden"
        actions={<DataStatus variant="live" connected={!error} />}
      />
      <div className="h-[360px] overflow-y-auto scrollbar-brand fade-bottom pl-3.5 pr-2 py-1">
        {!txs ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading transactions…"}</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {txs.map((t) => (
                <tr key={t.tx_hash} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <Link href={`/elysium/tx/${t.tx_hash}`} className="text-text-tertiary hover:text-brand">
                      {ago(elysiumTimeMs(t.block_time), now)}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <AddrLink address={t.from_addr} className="text-text-secondary" explorer={false} />
                  </td>
                  <td className="py-1.5 pr-2 text-text-tertiary">→</td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {t.contract_address ? (
                      <AddrLink address={t.contract_address} className="text-gold" explorer={false}>new contract</AddrLink>
                    ) : (
                      <AddrLink address={t.to_addr} className="text-text-secondary" explorer={false} />
                    )}
                  </td>
                  <td
                    className={`py-1.5 pr-2 whitespace-nowrap hidden sm:table-cell max-w-[140px] truncate ${
                      t.method_id && names?.[t.method_id] ? "text-text-secondary" : "text-text-tertiary"
                    }`}
                    title={(t.method_id && names?.[t.method_id]) || t.method_id || undefined}
                  >
                    {t.contract_address ? "deploy" : methodLabel(t.method_id, names)}
                  </td>
                  <td className={`py-1.5 text-right ${t.success ? "text-success" : "text-danger"}`}>{t.success ? "ok" : "fail"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

const ElysiumBlocks = memo(function ElysiumBlocks() {
  const { format } = useNumberFormat();
  const { data: blocks, error } = useElysiumBlocks(14);
  const now = useNow(3_000);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Blocks"
        actions={<DataStatus variant="live" connected={!error} />}
      />
      <div className="h-[360px] overflow-y-auto scrollbar-brand fade-bottom pl-3.5 pr-2 py-1">
        {!blocks ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading blocks…"}</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {blocks.map((b) => (
                <tr key={b.block_number} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <ExtLink href={`${EXPLORER}/block/${b.block_number}`} className="text-brand">
                      {formatNumber(b.block_number, format, { maximumFractionDigits: 0 })}
                    </ExtLink>
                  </td>
                  <td className="py-1.5 pr-2 text-right text-text-primary whitespace-nowrap" title="user transactions / all transactions">
                    {b.user_tx_count}
                    <span className="text-text-tertiary"> / {b.tx_count} tx</span>
                  </td>
                  <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap" title={`HyperEVM block ${b.l1_block_number}`}>
                    {ago(elysiumTimeMs(b.block_time), now)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

// ── Bridge ───────────────────────────────────────────────────────────────────
const ElysiumBridgeFeed = memo(function ElysiumBridgeFeed() {
  const { format } = useNumberFormat();
  const { data: transfers, error } = useElysiumBridgeTransfers(30);
  const { data: failed } = useElysiumRetryables();
  const now = useNow(5_000);
  const failedCount = failed?.length ?? 0;
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHead
        title="Bridge"
        tag="HyperEVM ↔ Elysium"
        actions={<>{<DataStatus variant="live" connected={!error} />}{failedCount > 0 ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger/10 text-danger" title="Retryable tickets whose redemption failed">
              {failedCount} failed redeem{failedCount > 1 ? "s" : ""}
            </span>
          ) : undefined}</>}
      />
      <RowFillList className="pl-3.5 pr-2 py-1">
        {!transfers ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading bridge transfers…"}</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {transfers.map((t) => {
                const hash = t.l2_tx_hash || t.l1_tx_hash;
                const done = t.status === "completed" || t.status === "executed";
                return (
                  <tr key={t.transfer_id} className="border-t border-border-subtle first:border-t-0">
                    <td className={`py-1.5 pr-2 font-semibold whitespace-nowrap ${t.direction === "deposit" ? "text-success" : "text-danger"}`}>
                      {t.direction === "deposit" ? (
                        <span className="inline-flex items-center gap-1"><ArrowDownLeft size={11} />IN</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><ArrowUpRight size={11} />OUT</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap text-text-primary">{t.symbol || t.asset}</td>
                    <td className="py-1.5 pr-2 text-right whitespace-nowrap text-text-primary">
                      {t.amount > 0 ? formatNumber(t.amount, format, { maximumFractionDigits: t.amount < 1 ? 4 : 2 }) : EMPTY}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap hidden sm:table-cell">
                      <AddrLink address={t.from_addr} className="text-text-tertiary" explorer={false} />
                    </td>
                    <td className="py-1.5 pr-2 text-right whitespace-nowrap text-text-tertiary" title="Time from initiation to completion">
                      {done ? duration(t.duration_s) : ago(elysiumTimeMs(t.initiated_time), now)}
                    </td>
                    <td className={`py-1.5 text-right whitespace-nowrap ${done ? "text-success" : "text-warning"}`}>
                      {hash && t.l2_tx_hash ? (
                        <Link href={`/elysium/tx/${t.l2_tx_hash}`} className="hover:text-brand">{t.status}</Link>
                      ) : (
                        t.status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </RowFillList>
    </Card>
  );
});

const ElysiumReserves = memo(function ElysiumReserves() {
  const { data: native } = useElysiumReserves("native");
  const { data: canonical } = useElysiumReserves("canonical");
  const rows = useMemo(
    () => [...(native ?? []), ...(canonical ?? []).filter((r) => r.symbol)].slice(0, 8),
    [native, canonical]
  );
  const unbacked = [...(native ?? []), ...(canonical ?? [])].filter((r) => !r.backed).length;
  const snapshot = native?.[0]?.snapshot_time;
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Bridge reserves"
        tag={snapshot ? `snapshot ${new Date(elysiumTimeMs(snapshot)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "every 15 min"}
      />
      <div className="p-3.5 space-y-2.5">
        {!native ? (
          <Empty>Loading reserves…</Empty>
        ) : (
          <>
            <div className="text-[11px] text-text-secondary">
              Locked in the HyperEVM escrow vs circulating on Elysium, in token units.{" "}
              {unbacked === 0 ? (
                <span className="text-success">Every asset listed is fully backed.</span>
              ) : (
                <span className="text-danger">{unbacked} under-backed.</span>
              )}
            </div>
            {rows.map((r) => {
              const pct = r.locked > 0 ? Math.min(100, (r.supply / r.locked) * 100) : 0;
              return (
                <div key={`${r.route}-${r.symbol}`} className="space-y-1">
                  <div className="flex items-center gap-2 text-[12px]">
                    {r.route === "native" ? <HypeMark logoOnly size="xs" /> : <Coins size={13} className="text-text-tertiary" />}
                    <span className="text-text-primary font-medium">{r.symbol}</span>
                    <span className="text-[10px] text-text-tertiary">{r.route}</span>
                    <span className="ml-auto mono text-text-secondary">
                      {compactCount(r.supply)} <span className="text-text-tertiary">/ {compactCount(r.locked)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <span className={`block h-full ${r.backed ? "bg-success/70" : "bg-danger"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </Card>
  );
});

// ── Settlement + tokens ──────────────────────────────────────────────────────
const ElysiumSettlement = memo(function ElysiumSettlement() {
  const { format } = useNumberFormat();
  const { data: batches } = useElysiumBatches(16);
  const { data: stats } = useElysiumStats();
  const unsettled = stats ? stats.last_block - stats.last_batched_block : null;
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHead
        title="Settlement"
        tag="batches posted on HyperEVM"
      />
      <div className="px-3.5 pt-2.5 text-[11px] text-text-secondary">
        {unsettled != null ? (
          <>
            <span className="mono text-text-primary">{formatNumber(unsettled, format, { maximumFractionDigits: 0 })}</span> blocks produced since the last settled batch.
          </>
        ) : (
          "…"
        )}
      </div>
      <RowFillList className="px-3.5 pb-2 pt-1" minHeight="lg:min-h-[200px]">
        {!batches ? (
          <Empty>Loading batches…</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {batches.map((b) => (
                <tr key={b.batch_number} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 text-brand">#{b.batch_number}</td>
                  <td className="py-1.5 pr-2 text-text-secondary whitespace-nowrap">
                    {formatNumber(b.block_count, format, { maximumFractionDigits: 0 })} blocks
                  </td>
                  <td className="py-1.5 pr-2 text-right text-text-tertiary whitespace-nowrap hidden xl:table-cell" title={`HyperEVM tx ${b.parent_tx_hash}`}>
                    HyperEVM #{formatNumber(b.parent_block, format, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-1.5 text-right text-text-tertiary whitespace-nowrap">{duration(b.posting_delay_s)} delay</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RowFillList>
    </Card>
  );
});

const ElysiumTokens = memo(function ElysiumTokens() {
  const { data: tokens } = useElysiumTokens(8);
  const { data: bridged } = useElysiumBridgedTokens();
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Tokens"
        tag="ERC-20s by transfer count"
      />
      <div className="px-3.5 py-1">
        {!tokens ? (
          <Empty>Loading tokens…</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <tbody>
              {tokens.map((t) => (
                <tr key={t.address} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <AddrLink address={t.address} className="text-text-primary" explorer={false}>{t.symbol || short(t.address)}</AddrLink>
                  </td>
                  <td className="py-1.5 pr-2 text-text-tertiary whitespace-nowrap truncate max-w-[140px] hidden xl:table-cell">{t.name}</td>
                  <td className="py-1.5 pr-2 text-text-tertiary">{t.origin}</td>
                  <td className="py-1.5 text-right text-text-secondary whitespace-nowrap">{compactCount(t.transfer_count)}<span className="hidden sm:inline"> transfers</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {bridged && bridged.length > 0 && (
        <div className="px-3.5 pb-3 pt-1 text-[11px] text-text-tertiary">
          Most bridged:{" "}
          {bridged.slice(0, 3).map((b, i) => (
            <span key={b.l2_token}>
              {i > 0 && " · "}
              <span className="text-text-secondary">{b.symbol}</span> {b.deposits} in / {b.withdrawals} out
            </span>
          ))}
        </div>
      )}
    </Card>
  );
});

/**
 * Elysium overview (testnet). REST snapshots from the backend proxy, polled on
 * short intervals for the live lists, plus the chain head from the public RPC.
 * Every figure is testnet: token units only, no USD values exist upstream.
 */
export function ElysiumOverview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
        <ElysiumMark size={13} className="text-text-secondary" />
        Testnet data: balances and amounts are test tokens with no market value.
      </div>
      <Link
        href="/elysium/start"
        className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 hover:border-brand/60 transition-colors"
      >
        <Rocket size={16} className="text-brand shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-text-primary">New to Elysium? Start here</span>
          <span className="block text-[12px] text-text-secondary">
            Add the network, claim free test HYPE and make your first transaction, or set up your tools to build.
          </span>
        </span>
        <span className="text-[12px] font-medium text-brand">Get started</span>
      </Link>
      <ElysiumKpis />
      <ElysiumActivity />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 min-w-0">
          <ElysiumTransactions />
        </div>
        <ElysiumBlocks />
      </div>
      {/* Stretch: the bridge feed fills the height of the reserves card. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0 flex flex-col">
          <ElysiumBridgeFeed />
        </div>
        <ElysiumReserves />
      </div>
      {/* Stretch: settlement lists as many batches as the tokens card is tall. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ElysiumSettlement />
        <ElysiumTokens />
      </div>
    </div>
  );
}
