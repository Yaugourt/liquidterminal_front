"use client";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "@/components/explorer/vaultValidatorSum/DataTable";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useDateFormat } from "@/store/date-format.store";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";
import { NumberFormatType } from "@/store/number-format.store";
import Link from "next/link";
import { useState } from "react";

interface VaultTableContentProps {
  vaults: VaultSummary[];
  isLoading: boolean;
  error: Error | null;
  format: NumberFormatType;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(text);
      }}
      className="group p-1 rounded transition-colors"
    >
      {copiedAddress === text ? (
        <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
      ) : (
        <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all duration-200" />
      )}
    </button>
  );
};

export function VaultTableContent({ vaults, isLoading, error, format }: VaultTableContentProps) {
  const { format: dateFormat } = useDateFormat();

  const handleDepositClick = (vaultAddress: string) => {
    window.open(`https://app.hyperliquid.xyz/vaults/${vaultAddress}`, "_blank");
  };

  return (
    <DataTable 
      isLoading={isLoading} 
      error={error}
      emptyMessage="No vaults available"
    >
      <TableHeader>
        <TableRow className="border-b border-white/5 hover:bg-transparent">
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Name</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Status</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">TVL</span>
          </TableHead>
          <TableHead className="py-3 px-3 text-right">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">APR</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Leader</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Created</span>
          </TableHead>
          <TableHead className="py-3 px-3 text-center">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Action</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vaults.map((vault: VaultSummary) => (
          <TableRow key={vault.summary.vaultAddress} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <TableCell className="py-3 px-3 text-white font-medium">{vault.summary.name}</TableCell>
            <TableCell className="py-3 px-3">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                !vault.summary.isClosed 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                {!vault.summary.isClosed ? 'Open' : 'Closed'}
              </span>
            </TableCell>
            <TableCell className="py-3 px-3 text-white font-medium">
              ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
            </TableCell>
            <TableCell className={`py-3 px-3 text-right font-medium ${vault.apr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </TableCell>
            <TableCell className="py-3 px-3">
              <div className="flex items-center gap-1.5">
                <Link 
                  href={`/explorer/address/${vault.summary.leader}`}
                  className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
                >
                  {vault.summary.leader.slice(0, 6)}...{vault.summary.leader.slice(-4)}
                </Link>
                <CopyButton text={vault.summary.leader} />
              </div>
            </TableCell>
            <TableCell className="py-3 px-3 text-white font-medium">
              {formatDate(vault.summary.createTimeMillis, dateFormat)}
            </TableCell>
            <TableCell className="py-3 px-3 text-center">
              <Button
                onClick={() => handleDepositClick(vault.summary.vaultAddress)}
                className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-bold px-3 py-1 text-xs flex items-center gap-1 mx-auto"
                disabled={vault.summary.isClosed}
              >
                Deposit
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
} 