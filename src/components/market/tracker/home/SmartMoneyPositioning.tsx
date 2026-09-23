"use client";

import { useMemo } from "react";
import {
  KpiRibbon,
  TypedDataTable,
  ModuleAsset,
  CellValue,
  CardHead,
  AuroraAreaChart,
  ShareTile,
  chartPalette,
  type KpiCell,
  type Column,
  CellBar,
} from "@/components/common";
import { Card } from "@/components/ui/card";
import { compactUsd, compactCount, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import {
  useAggregatePositioning,
  usePositioningHistory,
  type CoinPositioning,
} from "@/services/market/positioning";

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
  const { history } = usePositioningHistory(168);

  const rows = useMemo(
    () => (positioning?.coins ?? []).slice(0, TOP_N),
    [positioning]
  );

  const trend = useMemo(
    () => history.map((h) => ({ time: h.time, value: h.netNotional })),
    [history]
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
        sub: signedCompactUsd(t.netNotional),
        tone: netLong ? "success" : "danger",
      },
      { key: "long", label: "Long exposure", value: compactUsd(t.longNotional), sub: `${(t.longShare * 100).toFixed(0)}% of gross`, tone: "success" },
      { key: "short", label: "Short exposure", value: compactUsd(t.shortNotional), sub: `${((1 - t.longShare) * 100).toFixed(0)}% of gross`, tone: "danger" },
      { key: "traders", label: "Traders scanned", value: compactCount(positioning.tradersScanned), sub: `of ${positioning.cohortSize} cohort` },
    ];
  }, [positioning]);

  const columns: Column<CoinPositioning>[] = [
    {
      key: "coin",
      header: "Market",
      accessor: (c) => <ModuleAsset assetName={c.coin} name={c.coin} />,
    },
    {
      key: "long",
      header: "Long",
      align: "right",
      accessor: (c) => (
        <CellValue value={compactUsd(c.longNotional)} sub={`${compactCount(c.longCount)} traders`} tone="success" />
      ),
    },
    {
      key: "short",
      header: "Short",
      align: "right",
      accessor: (c) => (
        <CellValue value={compactUsd(c.shortNotional)} sub={`${compactCount(c.shortCount)} traders`} tone="danger" />
      ),
    },
    {
      key: "bias",
      header: "Long / Short",
      width: "160px",
      className: "max-sm:hidden",
      accessor: (c) => {
        const gross = c.longNotional + c.shortNotional;
        const longPct = gross > 0 ? (c.longNotional / gross) * 100 : 0;
        return (
          <CellBar
            width="full"
            title={`${longPct.toFixed(0)}% long`}
            segments={gross > 0 ? [
              { value: longPct / 100, tone: "success" },
              { value: 1 - longPct / 100, tone: "danger" },
            ] : []}
          />
        );
      },
    },
    {
      key: "net",
      header: "Net",
      type: "change",
      sortable: true,
      getSortValue: (c) => c.netNotional,
      accessor: (c) => signedCompactUsd(c.netNotional),
    },
  ];

  // Self-gate: no snapshot yet, or the route is unavailable.
  if (isLoading && !positioning) return null;
  if (error || !positioning || rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} />

      {/* Net-bias trend — self-built history, hidden until enough points land. */}
      {trend.length >= 2 && (
        <Card className="flex flex-col overflow-hidden">
          <CardHead title="Net bias trend" tag="7d · hourly" />
          <div className="p-3 h-[180px]">
            <AuroraAreaChart
              data={trend}
              height={150}
              lineColor={chartPalette.accent}
              formatValue={(v) => signedCompactUsd(v)}
            />
          </div>
        </Card>
      )}
      <TypedDataTable<CoinPositioning>
        title="Smart money positioning"
        subtitle="Collective open positions of the top traders, long vs short by market"
        headerAction={
          <ShareTile
            src="/api/tile/positioning"
            filename="smart-money-positioning"
          />
        }
        columns={columns}
        data={rows}
        getRowKey={(c) => c.coin}
      />
    </div>
  );
}
