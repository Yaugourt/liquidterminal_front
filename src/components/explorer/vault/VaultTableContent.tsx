"use client";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "@/components/common/DataTable";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { ExternalLink } from "lucide-react";
import { useDateFormat } from "@/store/date-format.store";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";
import { NumberFormatType } from "@/store/number-format.store";


interface VaultTableContentProps {
  vaults: VaultSummary[];
  isLoading: boolean;
  error: Error | null;
  format: NumberFormatType;
}



export function VaultTableContent({ vaults, isLoading, error, format }: VaultTableContentProps) {
  const { format: dateFormat } = useDateFormat();

  const handleDepositClick = (vaultAddress: string) => {
    window.open(`https://app.hyperliquid.xyz/vaults/${vaultAddress}`, "_blank");
  };

  return (
    <DataTable
      isLoading={isLoading}
      error={error}
      isEmpty={vaults.length === 0}
      emptyState={{
        title: "No vaults available"
      }}
    >
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Name</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Status</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">TVL</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">APR</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Leader</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Created</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-center">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaults.map((vault: VaultSummary) => (
            <TableRow key={vault.summary.vaultAddress} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
              <TableCell className="py-3 px-3 text-white font-medium">{vault.summary.name}</TableCell>
              <TableCell className="py-3 px-3">
                <StatusBadge variant={!vault.summary.isClosed ? 'success' : 'error'}>
                  {!vault.summary.isClosed ? 'Open' : 'Closed'}
                </StatusBadge>
              </TableCell>
              <TableCell className="py-3 px-3 text-white font-medium">
                ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className={`py-3 px-3 text-right font-medium ${vault.apr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </TableCell>
              <TableCell className="py-3 px-3">
                <AddressDisplay address={vault.summary.leader} />
              </TableCell>
              <TableCell className="py-3 px-3 text-white font-medium">
                {formatDate(vault.summary.createTimeMillis, dateFormat)}
              </TableCell>
              <TableCell className="py-3 px-3 text-center">
                <Button
                  onClick={() => handleDepositClick(vault.summary.vaultAddress)}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold px-3 py-1 text-xs flex items-center gap-1 mx-auto"
                  disabled={vault.summary.isClosed}
                >
                  Deposit
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  );
} 