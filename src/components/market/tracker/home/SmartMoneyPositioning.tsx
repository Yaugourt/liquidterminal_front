"use client";

import { useMemo } from "react";
import { Crosshair } from "lucide-react";
import {
  KpiRibbon,
  TypedDataTable,
  type KpiCell,
  type Column,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import {
  useAggregatePositioning,
  type CoinPositioning,
} from "@/services/market/positioning";

/** Signed compact USD, e.g. `+$1.2M` / `-$1.2M`. */
const signedUsd = (v: number) => `${v >= 0 ? "+" : "-"}$${compactUsd(Math.abs(v)).replace(/^\$/, "")}`;
const usd = (v: number) => `$${compactUsd(v).replace(/^\$/, "")}`;

/** How many coins to surface in the card (backend already sorts by gross exposure). */
const TOP_N = 18;

/**
 * What the smart-money cohort (top traders by volume and PnL) is collectively
 * long vs short right now, per coin. Backend-computed: the fan-out over the
 * cohort's open positions happens server-side, the front only displays it.
 * Only-here: aggregate positioning of the sharpest books is the biggest gap no
 * competitor fills. Hidden until a snapshot lands.
 */
export function SmartMoneyPositioning() {
  const { positioning, isLoading, error } = useAggregatePositioning();

  const rows = useMemo(
    () => (positioning?.coins ?? []).slice(0, TOP_N),
    [positioning]
  );

  const cells: KpiCell[] = useMemo(() => {
    if (!positioning) return [];
    const t = positioning.totals;
    const netLong = t.netNotional >= 0;
    return [
      {
        key: "bias",
        label: "Cohort net bias",
        value: netLong ? "Net long" : "Net short",
        sub: signedUsd(t.netNotional),
        tone: netLong ? "success" : "danger",
      },
      { key: "long", label: "Long exposure", value: usd(t.longNotional), sub: `${(t.longShare * 100).toFixed(0)}% of gross`, tone: "success" },
      { key: "short", label: "Short exposure", value: usd(t.shortNotional), sub: `${((1 - t.longShare) * 100).toFixed(0)}% of gross`, tone: "danger" },
      { key: "traders", label: "Traders scanned", value: compactCount(positioning.tradersScanned), sub: `of ${positioning.cohortSize} cohort` },
    ];
  }, [positioning]);

  const columns: Column<CoinPositioning>[] = [
    {
      key: "coin",
      header: "Market",
      accessor: (c) => <span className="mono text-text-primary font-medium">{c.coin}</span>,
    },
    {
      key: "long",
      header: "Long",
      align: "right",
      accessor: (c) => (
        <div className="flex flex-col items-end leading-tight">
          <span className="mono text-success">{usd(c.longNotional)}</span>
          <span className="text-[10px] text-text-tertiary">{c.longCount} traders</span>
        </div>
      ),
    },
    {
      key: "short",
      header: "Short",
      align: "right",
      accessor: (c) => (
        <div className="flex flex-col items-end leading-tight">
          <span className="mono text-danger">{usd(c.shortNotional)}</span>
          <span className="text-[10px] text-text-tertiary">{c.shortCount} traders</span>
        </div>
      ),
    },
    {
      key: "bias",
      header: "Long / Short",
      width: "160px",
      accessor: (c) => {
        const gross = c.longNotional + c.shortNotional;
        const longPct = gross > 0 ? (c.longNotional / gross) * 100 : 0;
        return (
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2" title={`${longPct.toFixed(0)}% long`}>
            <span className="bg-success" style={{ width: `${longPct}%` }} />
            <span className="bg-danger" style={{ width: `${100 - longPct}%` }} />
          </div>
        );
      },
    },
    {
      key: "net",
      header: "Net",
      align: "right",
      sortable: true,
      getSortValue: (c) => c.netNotional,
      accessor: (c) => (
        <span className={`mono ${c.netNotional >= 0 ? "text-success" : "text-danger"}`}>
          {signedUsd(c.netNotional)}
        </span>
      ),
    },
  ];

  // Self-gate: no snapshot yet, or the route is unavailable.
  if (isLoading && !positioning) return null;
  if (error || !positioning || rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} />
      <TypedDataTable
        title="Smart money positioning"
        icon={<Crosshair size={15} className="text-brand" />}
        subtitle="Collective open positions of the top traders, long vs short by market"
        columns={columns}
        data={rows}
        getRowKey={(c) => c.coin}
      />
    </div>
  );
}
