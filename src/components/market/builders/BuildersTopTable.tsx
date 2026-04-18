"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";
import { Loader2 } from "lucide-react";

interface BuildersTopTableProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  error: Error | null;
}

export function BuildersTopTable({ rows, isLoading, error }: BuildersTopTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">{error.message}</div>
    );
  }

  if (isLoading && rows.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] glass-panel">
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Builder</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Volume</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Builder fees
              </span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Users</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Fills</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const label = formatBuilderDisplayName(row.builderName);
            const initial =
              label === "—" ? row.builder.slice(2, 3) : label.charAt(0);
            return (
            <TableRow
              key={row.builder}
              className="border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer"
              onClick={() => router.push(`/market/builders/${encodeURIComponent(row.builder)}`)}
            >
              <TableCell className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent">
                    {initial.toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-sm font-medium truncate">
                      {label}
                    </span>
                    <span className="text-text-muted text-xs font-mono truncate">{row.builder}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                {formatNumber(row.totalVolume, format, {
                  maximumFractionDigits: 0,
                  currency: "$",
                  showCurrency: true,
                })}
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                {formatNumber(row.totalBuilderFees, format, {
                  maximumFractionDigits: 2,
                  currency: "$",
                  showCurrency: true,
                })}
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
