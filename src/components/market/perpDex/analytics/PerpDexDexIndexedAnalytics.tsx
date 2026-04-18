"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataTable } from "@/components/common/DataTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
  TableHeadLabel,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import {
  useHip3DexFills,
  useHip3DexOracleStats,
  useHip3DexSnapshots,
  useHip3DexOhlcv,
  useHip3GossipHistory,
} from "@/services/indexer/hip3";
import type { Hip3FillRow, Hip3OracleBucket, Hip3SnapshotRow } from "@/services/indexer/hip3/types";
import {
  chartColors,
  rechartsAxisDefaults,
  rechartsGridDefaults,
  rechartsTooltipContainer,
} from "@/components/common/charts/chartTheme";
import { IndexerSourceBanner } from "./IndexerSourceBanner";

type SortOrder = "asc" | "desc";

function sortRows<T>(rows: T[], getVal: (row: T) => number | string, order: SortOrder): T[] {
  return [...rows].sort((a, b) => {
    const va = getVal(a);
    const vb = getVal(b);
    const na = typeof va === "number" ? va : String(va);
    const nb = typeof vb === "number" ? vb : String(vb);
    const cmp =
      typeof na === "number" && typeof nb === "number"
        ? na - nb
        : String(na).localeCompare(String(nb));
    return order === "asc" ? cmp : -cmp;
  });
}

type OracleSortField = "bucket" | "max_deviation_pct" | "trade_count" | "mark_close";
type FillSortField = "time" | "notional" | "fee";
type SnapSortField = "volume_24h" | "open_interest" | "coin";

export function PerpDexDexIndexedAnalytics({
  dexId,
  coinOptions,
}: {
  dexId: string;
  /** HIP-3 coin names (e.g. dex:ASSET) from live HL meta */
  coinOptions: string[];
}) {
  const { format } = useNumberFormat();
  const { format: df } = useDateFormat();
  const defaultCoin = coinOptions[0] ?? "";
  const [ohlcvCoin, setOhlcvCoin] = useState(defaultCoin);

  useEffect(() => {
    if (coinOptions.length === 0) {
      setOhlcvCoin("");
      return;
    }
    if (!ohlcvCoin || !coinOptions.includes(ohlcvCoin)) {
      setOhlcvCoin(coinOptions[0]);
    }
  }, [coinOptions, ohlcvCoin]);

  const oracle = useHip3DexOracleStats(dexId, { limit: 120 });
  const fills = useHip3DexFills(dexId, { limit: 50 });
  const snaps = useHip3DexSnapshots(dexId);
  const gossipHist = useHip3GossipHistory(6);

  const ohlcvQuery = useMemo(
    () => (ohlcvCoin ? { coin: ohlcvCoin, dex_id: dexId, limit: 168 } : null),
    [ohlcvCoin, dexId]
  );
  const ohlcv = useHip3DexOhlcv(ohlcvQuery);

  const [oracleSort, setOracleSort] = useState<{ field: OracleSortField; order: SortOrder }>({
    field: "bucket",
    order: "desc",
  });
  const [fillSort, setFillSort] = useState<{ field: FillSortField; order: SortOrder }>({
    field: "time",
    order: "desc",
  });
  const [snapSort, setSnapSort] = useState<{ field: SnapSortField; order: SortOrder }>({
    field: "volume_24h",
    order: "desc",
  });

  const handleOracleSort = useCallback((field: OracleSortField) => {
    setOracleSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === "asc" ? "desc" : "asc" }
        : { field, order: "desc" }
    );
  }, []);

  const handleFillSort = useCallback((field: FillSortField) => {
    setFillSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === "asc" ? "desc" : "asc" }
        : { field, order: "desc" }
    );
  }, []);

  const handleSnapSort = useCallback((field: SnapSortField) => {
    setSnapSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === "asc" ? "desc" : "asc" }
        : { field, order: "desc" }
    );
  }, []);

  const oracleRows = useMemo(() => {
    const rows = oracle.data ?? [];
    const { field, order } = oracleSort;
    const getters: Record<OracleSortField, (r: Hip3OracleBucket) => number | string> = {
      bucket: (r) => r.bucket,
      max_deviation_pct: (r) => r.max_deviation_pct,
      trade_count: (r) => r.trade_count,
      mark_close: (r) => r.mark_close,
    };
    return sortRows(rows, getters[field], order);
  }, [oracle.data, oracleSort]);

  const fillRows = useMemo(() => {
    const rows = fills.data ?? [];
    const { field, order } = fillSort;
    const getters: Record<FillSortField, (r: Hip3FillRow) => number | string> = {
      time: (r) => r.time,
      notional: (r) => r.notional,
      fee: (r) => r.fee,
    };
    return sortRows(rows, getters[field], order);
  }, [fills.data, fillSort]);

  const snapRows = useMemo(() => {
    const rows = (snaps.data ?? []).filter((s) => s.dex_id === dexId);
    const { field, order } = snapSort;
    const getters: Record<SnapSortField, (r: Hip3SnapshotRow) => number | string> = {
      coin: (r) => r.coin,
      volume_24h: (r) => r.volume_24h,
      open_interest: (r) => r.open_interest,
    };
    return sortRows(rows, getters[field], order);
  }, [snaps.data, snapSort, dexId]);

  const chartPoints = useMemo(
    () =>
      (ohlcv.data ?? []).map((b) => ({
        t: new Date(b.time).getTime(),
        label: formatDateTime(b.time, df),
        close: b.close,
      })),
    [ohlcv.data, df]
  );

  const gossipRows = useMemo(() => {
    const raw = gossipHist.data ?? [];
    return raw.map((row, i) => ({ id: i, row }));
  }, [gossipHist.data]);

  return (
    <div className="space-y-6">
      <IndexerSourceBanner subtitle="Oracle buckets and fills are indexer-derived; compare with live Markets tab for mark prices." />

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Oracle (1m buckets)</h2>
        </div>
        <DataTable
          isLoading={oracle.isInitialLoading}
          error={oracle.error}
          isEmpty={!oracleRows.length && !oracle.isInitialLoading}
          emptyState={{ title: "No oracle stats", description: "Try again later or verify dex id." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[720px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <SortableTableHead
                    label="Bucket"
                    isActive={oracleSort.field === "bucket"}
                    sortDirection={oracleSort.field === "bucket" ? oracleSort.order : undefined}
                    onClick={() => handleOracleSort("bucket")}
                    className="py-3 px-3"
                  />
                  <SortableTableHead
                    label="Mark close"
                    isActive={oracleSort.field === "mark_close"}
                    sortDirection={oracleSort.field === "mark_close" ? oracleSort.order : undefined}
                    onClick={() => handleOracleSort("mark_close")}
                    className="py-3 px-3 text-right"
                  />
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Oracle close</TableHeadLabel>
                  </TableHead>
                  <SortableTableHead
                    label="Max dev %"
                    isActive={oracleSort.field === "max_deviation_pct"}
                    sortDirection={oracleSort.field === "max_deviation_pct" ? oracleSort.order : undefined}
                    onClick={() => handleOracleSort("max_deviation_pct")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Trades"
                    isActive={oracleSort.field === "trade_count"}
                    sortDirection={oracleSort.field === "trade_count" ? oracleSort.order : undefined}
                    onClick={() => handleOracleSort("trade_count")}
                    className="py-3 px-3 text-right"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {oracleRows.map((r) => (
                  <TableRow key={`${r.bucket}-${r.asset_id}`} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-table-cell tabular-nums">{r.bucket}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.mark_close, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.oracle_close, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.max_deviation_pct, format, { maximumFractionDigits: 4 })}%
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">{r.trade_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataTable>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Recent fills (indexed)</h2>
        </div>
        <DataTable
          isLoading={fills.isInitialLoading}
          error={fills.error}
          isEmpty={!fillRows.length && !fills.isInitialLoading}
          emptyState={{ title: "No fills", description: "No indexed fills for this DEX in the current window." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[900px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <SortableTableHead
                    label="Time"
                    isActive={fillSort.field === "time"}
                    sortDirection={fillSort.field === "time" ? fillSort.order : undefined}
                    onClick={() => handleFillSort("time")}
                    className="py-3 px-3"
                  />
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Coin</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Side</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Px</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Size</TableHeadLabel>
                  </TableHead>
                  <SortableTableHead
                    label="Notional"
                    isActive={fillSort.field === "notional"}
                    sortDirection={fillSort.field === "notional" ? fillSort.order : undefined}
                    onClick={() => handleFillSort("notional")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Fee"
                    isActive={fillSort.field === "fee"}
                    sortDirection={fillSort.field === "fee" ? fillSort.order : undefined}
                    onClick={() => handleFillSort("fee")}
                    className="py-3 px-3 text-right"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fillRows.map((r) => (
                  <TableRow key={r.hash} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-table-cell whitespace-nowrap">
                      {formatDateTime(r.time, df)}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-table-cell">{r.coin}</TableCell>
                    <TableCell className="py-3 px-3 text-table-cell">{r.side}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.px, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.sz, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.notional, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.fee, format, { maximumFractionDigits: 8 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataTable>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Snapshots (indexed)</h2>
        </div>
        <DataTable
          isLoading={snaps.isInitialLoading}
          error={snaps.error}
          isEmpty={!snapRows.length && !snaps.isInitialLoading}
          emptyState={{ title: "No snapshots", description: "Indexer returned no rows for this DEX." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[720px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <SortableTableHead
                    label="Coin"
                    isActive={snapSort.field === "coin"}
                    sortDirection={snapSort.field === "coin" ? snapSort.order : undefined}
                    onClick={() => handleSnapSort("coin")}
                    className="py-3 px-3"
                  />
                  <SortableTableHead
                    label="Vol 24h"
                    isActive={snapSort.field === "volume_24h"}
                    sortDirection={snapSort.field === "volume_24h" ? snapSort.order : undefined}
                    onClick={() => handleSnapSort("volume_24h")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Open interest"
                    isActive={snapSort.field === "open_interest"}
                    sortDirection={snapSort.field === "open_interest" ? snapSort.order : undefined}
                    onClick={() => handleSnapSort("open_interest")}
                    className="py-3 px-3 text-right"
                  />
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Funding</TableHeadLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapRows.map((r, idx) => (
                  <TableRow key={`${r.coin}-${idx}`} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-table-cell">{r.coin}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.volume_24h, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.open_interest, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.current_funding_rate, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataTable>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">OHLCV (hourly, indexed)</h2>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">Coin</span>
            {coinOptions.length > 0 ? (
              <Select value={ohlcvCoin || undefined} onValueChange={setOhlcvCoin}>
                <SelectTrigger className="glass-input h-9 w-[220px] border-border-subtle text-sm">
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  {coinOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-text-muted text-xs">No markets from live feed</span>
            )}
          </div>
        </div>
        <IndexerSourceBanner subtitle="Observation window follows indexer retention; not all history may be available." />
        <DataTable
          isLoading={ohlcv.isInitialLoading}
          error={ohlcv.error}
          isEmpty={!chartPoints.length && !ohlcv.isInitialLoading && !!ohlcvCoin}
          emptyState={{ title: "No OHLCV", description: "Pick a coin or try again later." }}
          className="!border-none !bg-transparent !shadow-none min-h-[220px]"
        >
          {chartPoints.length > 0 ? (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid {...rechartsGridDefaults} />
                  <XAxis dataKey="label" tick={rechartsAxisDefaults.tick} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tick={rechartsAxisDefaults.tick} width={56} domain={["auto", "auto"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const v = payload[0]?.value;
                      const n = typeof v === "number" ? v : Number(v);
                      return (
                        <div className={rechartsTooltipContainer}>
                          <p className="text-xs text-white tabular-nums">
                            Close: {formatNumber(Number.isFinite(n) ? n : 0, format, { maximumFractionDigits: 6 })}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={chartColors.cyan}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </DataTable>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Gossip priority-fee history (recent)
          </h2>
        </div>
        <DataTable
          isLoading={gossipHist.isInitialLoading}
          error={gossipHist.error}
          isEmpty={!gossipRows.length && !gossipHist.isInitialLoading}
          emptyState={{ title: "No gossip rows", description: "Indexer returned an empty history." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[520px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Row</TableHeadLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gossipRows.map(({ id, row }) => (
                  <TableRow key={id} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-xs text-table-cell font-mono break-all">
                      {typeof row === "object" && row !== null ? JSON.stringify(row) : String(row)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataTable>
      </div>
    </div>
  );
}
