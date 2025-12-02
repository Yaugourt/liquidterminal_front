import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "./DataTable";
import { Copy, Check } from "lucide-react";
import { NumberFormatType } from "@/store/number-format.store";
import { Validator } from "@/services/explorer/validator/types/validators";
import { FormattedStakingValidation, FormattedUnstakingQueueItem } from "@/services/explorer/validator/types/staking";
import { VaultSummary } from "@/services/explorer/vault/types";

import { useDateFormat } from "@/store/date-format.store";
import { formatDate, formatDateTime } from "@/lib/formatters/dateFormatting";
import { useState } from "react";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";

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

interface TableContentProps {
  activeTab: string;
  validatorSubTab: string;
  onValidatorSubTabChange: (subTab: 'all' | 'transactions' | 'unstaking') => void;
  validatorsData: {
    validators: Validator[];
    loading: boolean;
    error: Error | null;
  };
  vaultsData: {
    vaults: VaultSummary[];
    loading: boolean;
    error: Error | null;
  };
  stakingData: {
    validations: FormattedStakingValidation[];
    loading: boolean;
    error: Error | null;
  };
  unstakingData: {
    unstakingQueue: FormattedUnstakingQueueItem[];
    loading: boolean;
    error: Error | null;
  };
  format: NumberFormatType;
  startIndex: number;
  endIndex: number;
}

export function TableContent({ 
  activeTab, 
  validatorSubTab,
  validatorsData, 
  vaultsData,
  stakingData,
  unstakingData,
  format, 
  startIndex, 
  endIndex 
}: TableContentProps) {
  const { validators, loading: validatorsLoading, error: validatorsError } = validatorsData;
  const { vaults, loading: vaultsLoading, error: vaultsError } = vaultsData;
  const { validations: stakingValidations, loading: stakingLoading, error: stakingError } = stakingData;
  const { unstakingQueue, loading: unstakingLoading, error: unstakingError } = unstakingData;
  const { format: dateFormat } = useDateFormat();

  // Fonction pour trouver le nom du validator par son adresse
  const getValidatorName = (validatorAddress: string) => {
    const validator = validators.find((v: Validator) => v.address === validatorAddress || v.validator === validatorAddress);
    return validator ? validator.name : `${validatorAddress.slice(0, 6)}...${validatorAddress.slice(-4)}`;
  };

  if (activeTab === 'validators') {
    return (
      <div>
        
        {validatorSubTab === 'all' && (
          <DataTable 
            isLoading={validatorsLoading} 
            error={validatorsError}
            emptyMessage="No validators available"
          >
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Name</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Status</span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Staked HYPE</span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">APR</span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Commission</span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Uptime</span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Recent Blocks</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validators.slice(startIndex, endIndex).map((validator: Validator) => (
                <TableRow key={validator.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3 px-3 text-[#83E9FF] font-medium">{validator.name}</TableCell>
                  <TableCell className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      validator.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {validator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right text-white font-medium">
                    {formatNumber(validator.stake, format, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right text-emerald-400 font-medium">
                    {formatNumber(validator.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right text-white font-medium">
                    {formatNumber(validator.commission, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right text-white font-medium">
                    {formatNumber(validator.uptime, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right text-[#83E9FF] font-medium">
                    {formatNumber(validator.nRecentBlocks, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}

        {validatorSubTab === 'transactions' && (
          <DataTable 
            isLoading={stakingLoading} 
            error={stakingError}
            emptyMessage="No transactions available"
          >
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">User</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Type</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Amount</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Validator</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Hash</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakingValidations?.map((tx: FormattedStakingValidation) => (
                <TableRow key={tx.hash} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3 px-3 text-white font-medium">
                    {formatDateTime(tx.timestamp, dateFormat)}
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/explorer/address/${tx.user}`}
                        className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
                      >
                        {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                      </Link>
                      <CopyButton text={tx.user} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      tx.type === 'Undelegate'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {tx.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-white font-medium">
                    {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#83E9FF] font-mono text-xs">
                        {getValidatorName(tx.validator)}
                      </span>
                      <CopyButton text={tx.validator} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#83E9FF] font-mono text-xs">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </span>
                      <CopyButton text={tx.hash} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}

        {validatorSubTab === 'unstaking' && (
          <DataTable 
            isLoading={unstakingLoading} 
            error={unstakingError}
            emptyMessage="No pending unstaking requests"
          >
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">User</span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Amount</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unstakingQueue?.map((item: FormattedUnstakingQueueItem, index: number) => (
                <TableRow key={`${item.user}-${item.timestamp}-${index}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3 px-3 text-white font-medium">
                    {formatDateTime(item.timestamp, dateFormat)}
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/explorer/address/${item.user}`}
                        className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
                      >
                        {item.user.slice(0, 6)}...{item.user.slice(-4)}
                      </Link>
                      <CopyButton text={item.user} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-white font-medium">
                    {formatNumber(item.amount, format, { maximumFractionDigits: 2 })} HYPE
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}
      </div>
    );
  }

  return (
    <DataTable 
      isLoading={vaultsLoading} 
      error={vaultsError}
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
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
} 