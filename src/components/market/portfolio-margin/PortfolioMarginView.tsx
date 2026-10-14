"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuroraAreaChart, CardHead, DataStatus, KpiRibbon, PageHeader, TypedDataTable, chartPalette } from "@/components/common";
import type { Column, KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import {
  usePortfolioMargin,
  usePortfolioMarginHistory,
  type PmAccount,
  type PmReserve,
} from "@/services/market/portfolio-margin";

/**
 * Market · Portfolio margin: Hyperliquid's borrow/lend reserves and the
 * accounts that borrow against them.
 *
 * Reserves and account health are Hyperliquid's own values (read through the
 * HypeDexer proxy by our back). The account list is ours: Hyperliquid does not
 * publish one, so the back checks the mode of every eligible leaderboard
 * account and keeps the portfolio margin ones. No liquidation price is shown
 * yet: these accounts hedge with perps, and a price that ignores the hedge
 * would be wrong.
 */

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const amount = (v: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: v >= 1000 ? 0 : v >= 1 ? 2 : 4 });
const HISTORY_FROM = "Sep 23";

function HealthPill({ health, factor }: { health: string; factor: number | null }) {
  const cls =
    health === "healthy"
      ? "bg-success/10 text-success"
      : health === "atRisk"
        ? "bg-gold/10 text-gold"
        : "bg-danger/10 text-danger";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`rounded-full px-1.5 py-px text-[10.5px] ${cls}`}>{health === "atRisk" ? "At risk" : health}</span>
      {factor != null ? <span className="mono text-[11px] text-text-secondary">{factor < 100 ? factor.toFixed(3) : factor.toFixed(0)}</span> : null}
    </span>
  );
}

function TokenList({ items }: { items: PmAccount["supplies"] }) {
  if (!items.length) return <span className="text-text-tertiary">None</span>;
  return (
    <span className="mono text-[11.5px]">
      {items.map((t, i) => (
        <span key={t.token}>
          {i ? " · " : ""}
          {amount(t.amount)} {t.name}
        </span>
      ))}
    </span>
  );
}

/** Perp positions on the same coins as the account's collateral: the hedge, stated as is. */
function hedgeLine(a: PmAccount): string | null {
  const parts = a.supplies
    .map((s) => {
      const p = a.perps.find((x) => x.coin === s.name || (s.name === "UBTC" && x.coin === "BTC"));
      if (!p || p.size >= 0) return null;
      return `short ${amount(-p.size)} ${p.coin} perp vs ${amount(s.amount)} ${s.name} posted`;
    })
    .filter((x): x is string => !!x);
  return parts.length ? parts.join(" · ") : null;
}

function HistoryCard({ token, title, valueOf, format }: {
  token: number;
  title: string;
  valueOf: (r: { totalBorrowed: string; totalSupplied: string }) => number;
  format: (v: number) => string;
}) {
  const { data, error } = usePortfolioMarginHistory(token, "4h");
  const points = useMemo(() => (data ?? []).map((r) => ({ time: r.time, value: valueOf(r) })), [data, valueOf]);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead title={title} tag={`since ${HISTORY_FROM}, every 4h`} />
      <div className="px-2 pb-2 pt-1">
        {points.length > 1 ? (
          <AuroraAreaChart data={points} height={200} lineColor={chartPalette.accent} formatValue={format} />
        ) : (
          <div className="h-[200px] grid place-items-center text-[12px] text-text-tertiary">
            {error ? "The reserve history did not come back. Retrying in a moment." : "Loading the reserve history…"}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PortfolioMarginView() {
  const { data, error, isInitialLoading, dataUpdatedAt, isRefreshing, refetch } = usePortfolioMargin();

  const kpis = useMemo<KpiCell[]>(() => {
    if (!data) return [];
    const usdc = data.reserves.find((r) => r.name === "USDC");
    const borrowed = data.reserves.reduce((s, r) => s + r.borrowedUsd, 0);
    const collateral = data.reserves.filter((r) => r.ltv > 0).reduce((s, r) => s + r.suppliedUsd, 0);
    const atRisk = data.accounts.filter((a) => a.health !== "healthy").length;
    return [
      { label: "Borrowed", value: compactUsd(borrowed), sub: "all reserves, at oracle price" },
      { label: "Collateral posted", value: compactUsd(collateral), sub: data.reserves.filter((r) => r.ltv > 0).map((r) => r.name).join(" · ") },
      { label: "USDC utilization", value: usdc ? pct(usdc.utilization) : "—", sub: usdc ? `${compactUsd(usdc.suppliedUsd)} supplied` : undefined },
      { label: "USDC borrow / supply APY", value: usdc ? `${pct(usdc.borrowApy, 2)} / ${pct(usdc.supplyApy, 2)}` : "—" },
      { label: "Accounts found", value: data.scan.found.toLocaleString("en-US"), sub: `${data.scan.checked.toLocaleString("en-US")} of ${data.scan.candidates.toLocaleString("en-US")} eligible checked` },
      { label: "Not healthy", value: atRisk.toLocaleString("en-US"), tone: atRisk ? "gold" : undefined, sub: "Hyperliquid's own health label" },
    ];
  }, [data]);

  const reserveColumns = useMemo<Column<PmReserve>[]>(
    () => [
      { key: "name", header: "Asset", accessor: (r) => <span className="text-text-primary">{r.name}</span> },
      { key: "role", header: "Role", className: "hidden sm:table-cell", accessor: (r) => (r.ltv > 0 ? <span className="text-text-secondary">Collateral · LTV {r.ltv}</span> : <span className="text-text-secondary">Lent and borrowed</span>) },
      { key: "suppliedUsd", header: "Supplied", align: "right", accessor: (r) => <span className="mono">{compactUsd(r.suppliedUsd)}</span> },
      { key: "borrowedUsd", header: "Borrowed", align: "right", accessor: (r) => <span className="mono">{r.borrowedUsd > 0 ? compactUsd(r.borrowedUsd) : "—"}</span> },
      { key: "utilization", header: "Utilization", align: "right", accessor: (r) => <span className="mono">{r.totalBorrowed > 0 ? pct(r.utilization) : "—"}</span> },
      { key: "apy", header: "Borrow / supply APY", align: "right", className: "hidden md:table-cell", accessor: (r) => <span className="mono">{r.ltv > 0 ? "—" : `${pct(r.borrowApy, 2)} / ${pct(r.supplyApy, 2)}`}</span> },
      { key: "threshold", header: "Liquidation threshold", align: "right", className: "hidden lg:table-cell", accessor: (r) => <span className="mono">{r.liquidationThreshold != null ? r.liquidationThreshold.toFixed(3) : "—"}</span> },
    ],
    []
  );

  const accountColumns = useMemo<Column<PmAccount>[]>(
    () => [
      {
        key: "address",
        header: "Account",
        accessor: (a) => (
          <Link href={`/explorer/address/${a.address}`} title={a.address} className="mono text-brand hover:underline">
            {short(a.address)}
          </Link>
        ),
      },
      { key: "health", header: "Health", accessor: (a) => <HealthPill health={a.health} factor={a.healthFactor} /> },
      { key: "debtUsd", header: "Debt", align: "right", sortable: true, getSortValue: (a) => a.debtUsd, accessor: (a) => <span className="mono">{a.debtUsd > 0 ? compactUsd(a.debtUsd) : "—"}</span> },
      { key: "collateralUsd", header: "Collateral", align: "right", className: "hidden sm:table-cell", sortable: true, getSortValue: (a) => a.collateralUsd, accessor: (a) => <span className="mono">{compactUsd(a.collateralUsd)}</span> },
      { key: "supplies", header: "Posted", className: "hidden md:table-cell", accessor: (a) => <TokenList items={a.supplies.filter((s) => s.usd >= 1)} /> },
      {
        key: "perps",
        header: "Perps",
        className: "hidden lg:table-cell",
        accessor: (a) => {
          const hedge = hedgeLine(a);
          return hedge ?? (a.perps.length ? `${a.perps.length} position${a.perps.length > 1 ? "s" : ""}` : "None");
        },
      },
    ],
    []
  );

  const borrowers = data?.accounts.filter((a) => a.debtUsd > 0) ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Portfolio Margin"
        titleQualifier="· Hyperliquid borrow and lend"
        description="Spot and perps in one account: who lends, who borrows against HYPE and BTC, and how healthy each borrower is, read live from Hyperliquid."
        actions={<DataStatus variant="polled" updatedAt={dataUpdatedAt} isRefreshing={isRefreshing} onRefresh={refetch} />}
      />

      {data ? (
        <KpiRibbon cells={kpis} />
      ) : (
        <Card className="px-4 py-10 text-center text-[12px] text-text-tertiary">
          {error && !isInitialLoading ? "The reserves did not come back. Retrying in a moment." : "Reading the reserves…"}
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:items-start">
        <HistoryCard token={0} title="USDC borrowed" valueOf={(r) => Number(r.totalBorrowed)} format={(v) => compactUsd(v)} />
        <HistoryCard token={150} title="HYPE posted as collateral (HYPE)" valueOf={(r) => Number(r.totalSupplied)} format={(v) => `${(v / 1e6).toFixed(2)}M`} />
      </div>

      {data ? (
        <TypedDataTable<PmReserve>
          title="Reserves"
          subtitle="Stablecoins are lent and borrowed; HYPE and BTC are posted as collateral"
          data={data.reserves}
          columns={reserveColumns}
          getRowKey={(r) => r.token}
          density="compact"
        />
      ) : null}

      {data ? (
        <TypedDataTable<PmAccount>
          title="Borrowers"
          subtitle={`${borrowers.length} accounts with debt among the ${data.scan.found} portfolio margin accounts found · health and health factor are Hyperliquid's own`}
          data={borrowers}
          columns={accountColumns}
          getRowKey={(a) => a.address}
          density="compact"
          initialSort={{ field: "debtUsd", direction: "desc" }}
          paginate
          itemsPerPage={20}
          emptyMessage="No borrower found yet"
          emptyDescription="The scan checks the largest accounts first and keeps going every minute."
        />
      ) : null}

      <Card className="overflow-hidden">
        <CardHead title="How to read this page" />
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-[12px] leading-relaxed text-text-secondary max-w-[75ch]">
          <p>
            Portfolio margin puts spot and perps in one account. Balances you lack are borrowed automatically against the
            HYPE and BTC you hold, up to their loan-to-value (0.65 for HYPE, 0.5 for BTC). Lenders earn the borrow interest,
            minus 10% kept by the protocol as a liquidation buffer.
          </p>
          <p>
            The whole account is liquidated, not one position, once its portfolio margin ratio passes 0.95. Each collateral
            counts at its liquidation threshold, 0.5 + 0.5 × LTV. Liquidated assets are taken over by the system backstop,
            without going through the order book.
          </p>
          <p>
            Hyperliquid has no public list of these accounts. We check the mode of every account between $10k and $25M on the
            leaderboard, the documented eligibility range, largest first, so the list grows as the scan runs. Sub-accounts are
            margined separately and are not all on the leaderboard.
          </p>
          <p>
            Most large borrowers hedge: they short the perp of the coin they post. A liquidation price that ignores the hedge
            would be wrong, so this page shows Hyperliquid&apos;s own health instead of a price.{" "}
            <a
              href="https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Hyperliquid docs
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
