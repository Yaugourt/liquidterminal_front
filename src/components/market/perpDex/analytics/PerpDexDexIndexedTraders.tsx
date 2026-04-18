"use client";

import { useCallback, useMemo, useState } from "react";
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
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useHip3DexLeaderboard, useHip3DexStatsTraders } from "@/services/indexer/hip3";
import type { Hip3LeaderboardRow, Hip3TraderStatRow } from "@/services/indexer/hip3/types";
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

type LbSort = "total_volume" | "total_fees" | "total_trades" | "pnl_realized";
type StSort = "total_volume" | "total_fees" | "coin";

export function PerpDexDexIndexedTraders({ dexId }: { dexId: string }) {
  const { format } = useNumberFormat();
  const lb = useHip3DexLeaderboard(dexId, { limit: 40 });
  const st = useHip3DexStatsTraders(dexId, { limit: 40 });

  const [lbSort, setLbSort] = useState<{ field: LbSort; order: SortOrder }>({
    field: "total_volume",
    order: "desc",
  });
  const [stSort, setStSort] = useState<{ field: StSort; order: SortOrder }>({
    field: "total_volume",
    order: "desc",
  });

  const handleLb = useCallback((field: LbSort) => {
    setLbSort((p) =>
      p.field === field ? { field, order: p.order === "asc" ? "desc" : "asc" } : { field, order: "desc" }
    );
  }, []);

  const handleSt = useCallback((field: StSort) => {
    setStSort((p) =>
      p.field === field ? { field, order: p.order === "asc" ? "desc" : "asc" } : { field, order: "desc" }
    );
  }, []);

  const lbRows = useMemo(() => {
    const rows = lb.data ?? [];
    const getters: Record<LbSort, (r: Hip3LeaderboardRow) => number | string> = {
      total_volume: (r) => r.total_volume,
      total_fees: (r) => r.total_fees,
      total_trades: (r) => r.total_trades,
      pnl_realized: (r) => r.pnl_realized,
    };
    return sortRows(rows, getters[lbSort.field], lbSort.order);
  }, [lb.data, lbSort]);

  const stRows = useMemo(() => {
    const rows = st.data ?? [];
    const getters: Record<StSort, (r: Hip3TraderStatRow) => number | string> = {
      total_volume: (r) => r.total_volume,
      total_fees: (r) => r.total_fees,
      coin: (r) => r.coin,
    };
    return sortRows(rows, getters[stSort.field], stSort.order);
  }, [st.data, stSort]);

  return (
    <div className="space-y-6">
      <IndexerSourceBanner subtitle="Leaderboard and per-trader stats are indexer snapshots; not a substitute for on-chain PnL accounting." />

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Leaderboard</h2>
        </div>
        <DataTable
          isLoading={lb.isInitialLoading}
          error={lb.error}
          isEmpty={!lbRows.length && !lb.isInitialLoading}
          emptyState={{ title: "No leaderboard", description: "No indexed traders for this DEX." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[720px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Trader</TableHeadLabel>
                  </TableHead>
                  <SortableTableHead
                    label="Volume"
                    isActive={lbSort.field === "total_volume"}
                    sortDirection={lbSort.field === "total_volume" ? lbSort.order : undefined}
                    onClick={() => handleLb("total_volume")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Fees"
                    isActive={lbSort.field === "total_fees"}
                    sortDirection={lbSort.field === "total_fees" ? lbSort.order : undefined}
                    onClick={() => handleLb("total_fees")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Trades"
                    isActive={lbSort.field === "total_trades"}
                    sortDirection={lbSort.field === "total_trades" ? lbSort.order : undefined}
                    onClick={() => handleLb("total_trades")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="PnL realized"
                    isActive={lbSort.field === "pnl_realized"}
                    sortDirection={lbSort.field === "pnl_realized" ? lbSort.order : undefined}
                    onClick={() => handleLb("pnl_realized")}
                    className="py-3 px-3 text-right"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lbRows.map((r) => (
                  <TableRow key={r.trader} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-table-cell font-mono text-xs">{r.trader}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.total_volume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.total_fees, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">{r.total_trades}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.pnl_realized, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataTable>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Per-trader stats</h2>
        </div>
        <DataTable
          isLoading={st.isInitialLoading}
          error={st.error}
          isEmpty={!stRows.length && !st.isInitialLoading}
          emptyState={{ title: "No trader stats", description: "Indexer returned no per-trader rows." }}
          className="!border-none !bg-transparent !shadow-none"
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Trader</TableHeadLabel>
                  </TableHead>
                  <SortableTableHead
                    label="Coin"
                    isActive={stSort.field === "coin"}
                    sortDirection={stSort.field === "coin" ? stSort.order : undefined}
                    onClick={() => handleSt("coin")}
                    className="py-3 px-3"
                  />
                  <SortableTableHead
                    label="Volume"
                    isActive={stSort.field === "total_volume"}
                    sortDirection={stSort.field === "total_volume" ? stSort.order : undefined}
                    onClick={() => handleSt("total_volume")}
                    className="py-3 px-3 text-right"
                  />
                  <SortableTableHead
                    label="Fees"
                    isActive={stSort.field === "total_fees"}
                    sortDirection={stSort.field === "total_fees" ? stSort.order : undefined}
                    onClick={() => handleSt("total_fees")}
                    className="py-3 px-3 text-right"
                  />
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Trades</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">PnL</TableHeadLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stRows.map((r) => (
                  <TableRow key={`${r.trader}-${r.coin}`} className="border-b border-border-subtle hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-3 text-table-cell font-mono text-xs">{r.trader}</TableCell>
                    <TableCell className="py-3 px-3 text-table-cell">{r.coin}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.total_volume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.total_fees, format, { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">{r.total_trades}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(r.pnl_realized, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
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
