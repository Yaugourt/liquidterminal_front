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
  ModuleTable,
  ModuleTableRow,
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
  const { data: txs, error, isStale } = useElysiumTransactions(14);
  // Selector -> signature map (our backend, top selectors only); hex stays when unknown.
  const { data: methods } = useElysiumMethods("24h");
  const names = methods?.names;
  const now = useNow(3_000);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Latest transactions"
        tag="spam and system hidden"
        actions={<DataStatus variant="live" connected={!error && !isStale} />}
      />
      <div className="h-[360px] overflow-y-auto scrollbar-brand fade-bottom">
        {!txs ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading transactions…"}</Empty>
        ) : txs.length === 0 ? (
          <Empty>No transaction indexed yet.</Empty>
        ) : (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Age", width: 60, align: "left" },
              { header: "From", width: 114, align: "left" },
              { header: <span className="sr-only">To</span>, width: 36, align: "left", className: "hidden sm:table-cell" },
              { header: "To", width: 124, align: "left" },
              // No width: Method takes the room left and truncates (its title has the signature).
              { header: "Method", align: "left", className: "hidden sm:table-cell" },
              { header: "Status", width: 72, className: "hidden sm:table-cell" },
            ]}
          >
            {txs.map((t) => (
              <ModuleTableRow
                key={t.tx_hash}
                cells={[
                  <span key="age" className="mono whitespace-nowrap">
                    <Link href={`/elysium/tx/${t.tx_hash}`} className="text-text-tertiary hover:text-brand">
                      {ago(elysiumTimeMs(t.block_time), now)}
                    </Link>
                  </span>,
                  <span key="from" className="mono whitespace-nowrap">
                    <AddrLink address={t.from_addr} className="text-text-secondary" explorer={false} />
                  </span>,
                  <span key="arrow" className="mono text-text-tertiary">→</span>,
                  <span key="to" className="mono whitespace-nowrap">
                    {t.contract_address ? (
                      <AddrLink address={t.contract_address} className="text-gold" explorer={false}>new contract</AddrLink>
                    ) : (
                      <AddrLink address={t.to_addr} className="text-text-secondary" explorer={false} />
                    )}
                  </span>,
                  <span
                    key="method"
                    className={`mono block truncate whitespace-nowrap ${
                      t.method_id && names?.[t.method_id] ? "text-text-secondary" : "text-text-tertiary"
                    }`}
                    title={(t.method_id && names?.[t.method_id]) || t.method_id || undefined}
                  >
                    {t.contract_address ? "deploy" : methodLabel(t.method_id, names)}
                  </span>,
                  <span key="status" className={`mono ${t.success ? "text-success" : "text-danger"}`}>{t.success ? "ok" : "fail"}</span>,
                ]}
              />
            ))}
          </ModuleTable>
        )}
      </div>
    </Card>
  );
});

const ElysiumBlocks = memo(function ElysiumBlocks() {
  const { format } = useNumberFormat();
  const { data: blocks, error, isStale } = useElysiumBlocks(14);
  const now = useNow(3_000);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Blocks"
        actions={<DataStatus variant="live" connected={!error && !isStale} />}
      />
      <div className="h-[360px] overflow-y-auto scrollbar-brand fade-bottom">
        {!blocks ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading blocks…"}</Empty>
        ) : blocks.length === 0 ? (
          <Empty>No block indexed yet.</Empty>
        ) : (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Block", width: 114 },
              { header: "Txs", width: 100 },
              { header: "Age", width: 60 },
            ]}
          >
            {blocks.map((b) => (
              <ModuleTableRow
                key={b.block_number}
                cells={[
                  <span key="block" className="mono whitespace-nowrap">
                    <ExtLink href={`${EXPLORER}/block/${b.block_number}`} className="text-brand">
                      {formatNumber(b.block_number, format, { maximumFractionDigits: 0 })}
                    </ExtLink>
                  </span>,
                  <span key="txs" className="mono whitespace-nowrap text-text-primary" title="user transactions / all transactions">
                    {b.user_tx_count}
                    <span className="text-text-tertiary"> / {b.tx_count}</span>
                  </span>,
                  <span key="age" className="mono whitespace-nowrap text-text-tertiary" title={`HyperEVM block ${b.l1_block_number}`}>
                    {ago(elysiumTimeMs(b.block_time), now)}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
        )}
      </div>
    </Card>
  );
});

// ── Bridge ───────────────────────────────────────────────────────────────────
const ElysiumBridgeFeed = memo(function ElysiumBridgeFeed() {
  const { format } = useNumberFormat();
  const { data: transfers, error, isStale } = useElysiumBridgeTransfers(30);
  const { data: failed } = useElysiumRetryables();
  const now = useNow(5_000);
  const failedCount = failed?.length ?? 0;
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHead
        title="Bridge"
        tag="HyperEVM ↔ Elysium"
        actions={<>{<DataStatus variant="live" connected={!error && !isStale} />}{failedCount > 0 ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger/10 text-danger" title="Retryable tickets whose redemption failed">
              {failedCount} failed redeem{failedCount > 1 ? "s" : ""}
            </span>
          ) : undefined}</>}
      />
      <RowFillList>
        {!transfers ? (
          <Empty>{error ? "Elysium data is unavailable right now." : "Loading bridge transfers…"}</Empty>
        ) : transfers.length === 0 ? (
          <Empty>No bridge transfer indexed yet.</Empty>
        ) : (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Dir", width: 67, align: "left" },
              { header: "Asset", width: 76, align: "left" },
              { header: "Amount", width: 107 },
              { header: "From", width: 114, align: "left", className: "hidden sm:table-cell lg:hidden xl:table-cell" },
              { header: "Time", width: 76, className: "hidden sm:table-cell" },
              { header: "Status", width: 138, className: "hidden sm:table-cell" },
            ]}
          >
            {transfers.map((t) => {
              const hash = t.l2_tx_hash || t.l1_tx_hash;
              const done = t.status === "completed" || t.status === "executed";
              return (
                <ModuleTableRow
                  key={t.transfer_id}
                  cells={[
                    <span key="dir" className={`mono font-semibold whitespace-nowrap ${t.direction === "deposit" ? "text-success" : "text-danger"}`}>
                      {t.direction === "deposit" ? (
                        <span className="inline-flex items-center gap-1"><ArrowDownLeft size={11} />IN</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><ArrowUpRight size={11} />OUT</span>
                      )}
                    </span>,
                    <span key="asset" className="mono block truncate whitespace-nowrap text-text-primary" title={t.symbol || t.asset}>{t.symbol || t.asset}</span>,
                    <span key="amt" className="mono whitespace-nowrap text-text-primary">
                      {t.amount > 0 ? formatNumber(t.amount, format, { maximumFractionDigits: t.amount < 1 ? 4 : 2 }) : EMPTY}
                    </span>,
                    <span key="from" className="mono whitespace-nowrap">
                      <AddrLink address={t.from_addr} className="text-text-tertiary" explorer={false} />
                    </span>,
                    <span key="time" className="mono whitespace-nowrap text-text-tertiary" title="Time from initiation to completion">
                      {done ? duration(t.duration_s) : ago(elysiumTimeMs(t.initiated_time), now)}
                    </span>,
                    <span key="status" className={`mono whitespace-nowrap ${done ? "text-success" : "text-warning"}`}>
                      {hash && t.l2_tx_hash ? (
                        <Link href={`/elysium/tx/${t.l2_tx_hash}`} className="hover:text-brand">{t.status}</Link>
                      ) : (
                        t.status
                      )}
                    </span>,
                  ]}
                />
              );
            })}
          </ModuleTable>
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
      <RowFillList minHeight="lg:min-h-[200px]">
        {!batches ? (
          <Empty>Loading batches…</Empty>
        ) : batches.length === 0 ? (
          <Empty>No batch posted yet.</Empty>
        ) : (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Batch", width: 76 },
              { header: "Blocks", width: 84, align: "left" },
              { header: "HyperEVM", width: 124, className: "hidden xl:table-cell" },
              { header: "Delay", width: 76 },
            ]}
          >
            {batches.map((b) => (
              <ModuleTableRow
                key={b.batch_number}
                cells={[
                  <span key="batch" className="mono text-brand">#{b.batch_number}</span>,
                  <span key="blocks" className="mono whitespace-nowrap text-text-secondary">
                    {formatNumber(b.block_count, format, { maximumFractionDigits: 0 })}
                  </span>,
                  <span key="parent" className="mono whitespace-nowrap text-text-tertiary" title={`HyperEVM tx ${b.parent_tx_hash}`}>
                    #{formatNumber(b.parent_block, format, { maximumFractionDigits: 0 })}
                  </span>,
                  <span key="delay" className="mono whitespace-nowrap text-text-tertiary">{duration(b.posting_delay_s)}</span>,
                ]}
              />
            ))}
          </ModuleTable>
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
      <div>
        {!tokens ? (
          <Empty>Loading tokens…</Empty>
        ) : tokens.length === 0 ? (
          <Empty>No token indexed yet.</Empty>
        ) : (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Token", width: 114 },
              // No width: Name takes the room left and truncates (its title has the full name).
              { header: "Name", align: "left", className: "hidden xl:table-cell" },
              { header: "Origin", width: 100, align: "left" },
              { header: "Transfers", width: 92 },
            ]}
          >
            {tokens.map((t) => (
              <ModuleTableRow
                key={t.address}
                cells={[
                  <span key="token" className="mono block truncate whitespace-nowrap" title={t.symbol || t.address}>
                    <AddrLink address={t.address} className="text-text-primary" explorer={false}>{t.symbol || short(t.address)}</AddrLink>
                  </span>,
                  <span key="name" className="mono block truncate whitespace-nowrap text-text-tertiary" title={t.name || undefined}>{t.name}</span>,
                  <span key="origin" className="mono text-text-tertiary">{t.origin}</span>,
                  <span key="tr" className="mono whitespace-nowrap text-text-secondary">{compactCount(t.transfer_count)}</span>,
                ]}
              />
            ))}
          </ModuleTable>
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
        className="flex flex-wrap items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 hover:border-brand/60 transition-colors"
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 min-w-0">
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
