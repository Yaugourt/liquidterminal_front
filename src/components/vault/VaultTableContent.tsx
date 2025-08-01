"use client";
import { formatNumber } from "@/lib/numberFormatting";
import { DataTable } from "@/components/explorer/vaultValidatorSum/DataTable";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useDateFormat } from "@/store/date-format.store";
import { formatDate } from "@/lib/dateFormatting";
import { VaultSummary } from "@/services/vault/types";
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
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
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
      emptyMessage="Aucun vault disponible"
    >
      <TableHeader className="text-white">
        <TableRow>
          <TableHead className="text-left py-3 px-6 font-normal">Name</TableHead>
          <TableHead className="text-left py-3 px-6 font-normal">Status</TableHead>
          <TableHead className="text-left py-3 px-6 font-normal">TVL</TableHead>
          <TableHead className="text-right py-3 px-6 font-normal">APR</TableHead>
          <TableHead className="text-left py-3 px-6 font-normal">Leader</TableHead>
          <TableHead className="text-left py-3 px-6 font-normal">Created</TableHead>
          <TableHead className="text-center py-3 px-6 font-normal">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vaults.map((vault: VaultSummary) => (
          <TableRow key={vault.summary.vaultAddress} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
            <TableCell className="py-3 px-6 text-white font-medium">{vault.summary.name}</TableCell>
            <TableCell className="py-3 px-6">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                !vault.summary.isClosed 
                  ? 'bg-[#4ADE8020] text-[#4ADE80] border border-[#4ADE8040]' 
                  : 'bg-[#FF575720] text-[#FF5757] border border-[#FF575740]'
              }`}>
                {!vault.summary.isClosed ? 'Open' : 'Closed'}
              </span>
            </TableCell>
            <TableCell className="py-3 px-6 text-left text-white">
              ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
            </TableCell>
            <TableCell className={`py-3 px-6 text-right ${vault.apr >= 0 ? 'text-[#4ADE80]' : 'text-[#FF5757]'}`}>
              {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </TableCell>
            <TableCell className="py-3 px-6">
              <div className="flex items-center gap-2">
                <Link 
                  href={`/explorer/address/${vault.summary.leader}`}
                  className="text-[#83E9FF] font-inter text-sm hover:text-[#83E9FF]/80 transition-colors"
                >
                  {vault.summary.leader.slice(0, 6)}...{vault.summary.leader.slice(-4)}
                </Link>
                <CopyButton text={vault.summary.leader} />
              </div>
            </TableCell>
            <TableCell className="py-3 px-6 text-white">
              {formatDate(vault.summary.createTimeMillis, dateFormat)}
            </TableCell>
            <TableCell className="py-3 px-6 text-center">
              <Button
                onClick={() => handleDepositClick(vault.summary.vaultAddress)}
                className="bg-[#F9E370] hover:bg-[#F9E370]/90 text-black font-medium px-3 py-1 text-xs flex items-center gap-1 mx-auto"
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