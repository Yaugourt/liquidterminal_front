import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { NumberFormatType } from "@/store/number-format.store";
import { Validator } from "@/services/explorer/validator/types/validators";
import { FormattedStakingValidation, FormattedUnstakingQueueItem } from "@/services/explorer/validator/types/staking";
import { VaultSummary } from "@/services/explorer/vault/types";

import { useDateFormat } from "@/store/date-format.store";
import { formatDate, formatDateTime } from "@/lib/formatters/dateFormatting";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PaginationProps } from "@/components/common/pagination";


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
  pagination?: PaginationProps;
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
  endIndex,
  pagination
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
            isEmpty={validators.length === 0}
            emptyState={{
              title: "No validators available"
            }}
            pagination={pagination}
          >
            <Table className="w-full">
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
                    <TableCell className="py-3 px-3 text-brand-accent font-medium">{validator.name}</TableCell>
                    <TableCell className="py-3 px-3">
                      <StatusBadge variant={validator.isActive ? 'success' : 'error'}>
                        {validator.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
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
                    <TableCell className="py-3 px-3 text-right text-brand-accent font-medium">
                      {formatNumber(validator.nRecentBlocks, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        )}

        {validatorSubTab === 'transactions' && (
          <DataTable
            isLoading={stakingLoading}
            error={stakingError}
            isEmpty={!stakingValidations || stakingValidations.length === 0}
            emptyState={{
              title: "No transactions available"
            }}
            pagination={pagination}
          >
            <Table className="w-full">
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
                      <AddressDisplay address={tx.user} />
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <StatusBadge variant={tx.type === 'Undelegate' ? 'error' : 'success'}>
                        {tx.type}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-white font-medium">
                      {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <AddressDisplay address={tx.validator} label={getValidatorName(tx.validator)} />
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <AddressDisplay address={tx.hash} showExternalLink={true} showCopy={true} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        )}

        {validatorSubTab === 'unstaking' && (
          <DataTable
            isLoading={unstakingLoading}
            error={unstakingError}
            isEmpty={!unstakingQueue || unstakingQueue.length === 0}
            emptyState={{
              title: "No pending unstaking requests"
            }}
            pagination={pagination}
          >
            <Table className="w-full">
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
                      <AddressDisplay address={item.user} />
                    </TableCell>
                    <TableCell className="py-3 px-3 text-white font-medium">
                      {formatNumber(item.amount, format, { maximumFractionDigits: 2 })} HYPE
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        )}
      </div>
    );
  }

  return (
    <DataTable
      isLoading={vaultsLoading}
      error={vaultsError}
      isEmpty={vaults.length === 0}
      emptyState={{
        title: "No vaults available"
      }}
      pagination={pagination}
    >
      <Table className="w-full">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  );
} 