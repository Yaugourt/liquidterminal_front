"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Loader2 } from "lucide-react";

interface BuilderUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  error: Error | null;
}

function pickUserKey(row: BuilderUserRow): string {
  const u = row.user ?? row.address;
  return typeof u === "string" ? u : "—";
}

export function BuilderUsersTable({ users, isLoading, error }: BuilderUsersTableProps) {
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">{error.message}</div>
    );
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-[160px] glass-panel">
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-text-muted text-sm border border-border-subtle">
        No top users for this window.
      </div>
    );
  }

  const feeKey = users[0].totalBuilderFees !== undefined ? "totalBuilderFees" : "builderFees";
  const hasFee = users.some((u) => typeof u[feeKey] === "number");

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">User</span>
            </TableHead>
            {hasFee && (
              <TableHead className="py-3 px-3 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Builder fees
                </span>
              </TableHead>
            )}
            {users[0].volume !== undefined && (
              <TableHead className="py-3 px-3 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Volume</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((row, idx) => (
            <TableRow key={`${pickUserKey(row)}-${idx}`} className="border-b border-border-subtle">
              <TableCell className="py-3 px-3 text-xs text-white font-mono break-all">{pickUserKey(row)}</TableCell>
              {hasFee && (
                <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                  {typeof row[feeKey] === "number"
                    ? formatNumber(row[feeKey] as number, format, {
                        maximumFractionDigits: 4,
                        currency: "$",
                        showCurrency: true,
                      })
                    : "—"}
                </TableCell>
              )}
              {users[0].volume !== undefined && (
                <TableCell className="py-3 px-3 text-right text-sm text-white tabular-nums">
                  {typeof row.volume === "number"
                    ? formatNumber(row.volume, format, {
                        maximumFractionDigits: 0,
                        currency: "$",
                        showCurrency: true,
                      })
                    : "—"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
