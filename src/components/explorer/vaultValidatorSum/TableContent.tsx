import { formatNumber } from "@/lib/formatters/numberFormatting";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { NumberFormatType } from "@/store/number-format.store";
import { Validator } from "@/services/explorer/validator/types/validators";
import { FormattedStakingValidation, FormattedUnstakingQueueItem } from "@/services/explorer/validator/types/staking";
import { VaultSummary } from "@/services/explorer/vault/types";
import { Liquidation } from "@/services/explorer/liquidation";

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
  liquidationsData: {
    liquidations: Liquidation[];
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
  liquidationsData,
  format,
  startIndex,
  endIndex,
  pagination
}: TableContentProps) {
  const { validators, loading: validatorsLoading, error: validatorsError } = validatorsData;
  const { vaults, loading: vaultsLoading, error: vaultsError } = vaultsData;
  const { validations: stakingValidations, loading: stakingLoading, error: stakingError } = stakingData;
  const { unstakingQueue, loading: unstakingLoading, error: unstakingError } = unstakingData;
  const { liquidations, loading: liquidationsLoading, error: liquidationsError } = liquidationsData;
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
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Staked HYPE</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Uptime</TableHead>
                  <TableHead className="text-right">Recent Blocks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validators.slice(startIndex, endIndex).map((validator: Validator) => (
                  <TableRow key={validator.name} className="hover:bg-white/[0.02]">
                    <TableCell className="text-sm text-brand-accent font-medium">{validator.name}</TableCell>
                    <TableCell className="text-sm">
                      <StatusBadge variant={validator.isActive ? 'success' : 'error'}>
                        {validator.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-right text-white font-medium">
                      {formatNumber(validator.stake, format, { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-right text-emerald-400 font-medium">
                      {formatNumber(validator.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </TableCell>
                    <TableCell className="text-sm text-right text-white font-medium">
                      {formatNumber(validator.commission, format, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                    </TableCell>
                    <TableCell className="text-sm text-right text-white font-medium">
                      {formatNumber(validator.uptime, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </TableCell>
                    <TableCell className="text-sm text-right text-brand-accent font-medium">
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
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Validator</TableHead>
                  <TableHead>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakingValidations?.map((tx: FormattedStakingValidation) => (
                  <TableRow key={tx.hash} className="hover:bg-white/[0.02]">
                    <TableCell className="text-sm text-white font-medium">
                      {formatDateTime(tx.timestamp, dateFormat)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <AddressDisplay address={tx.user} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <StatusBadge variant={tx.type === 'Undelegate' ? 'error' : 'success'}>
                        {tx.type}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-white font-medium">
                      {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
                    </TableCell>
                    <TableCell className="text-sm">
                      <AddressDisplay address={tx.validator} label={getValidatorName(tx.validator)} />
                    </TableCell>
                    <TableCell className="text-sm">
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
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unstakingQueue?.map((item: FormattedUnstakingQueueItem, index: number) => (
                  <TableRow key={`${item.user}-${item.timestamp}-${index}`} className="hover:bg-white/[0.02]">
                    <TableCell className="text-sm text-white font-medium">
                      {formatDateTime(item.timestamp, dateFormat)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <AddressDisplay address={item.user} />
                    </TableCell>
                    <TableCell className="text-sm text-white font-medium">
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

  if (activeTab === 'liquidations') {
    return (
      <DataTable
        isLoading={liquidationsLoading}
        error={liquidationsError}
        isEmpty={liquidations.length === 0}
        emptyState={{
          title: "No liquidations available"
        }}
        pagination={pagination}
        className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Time</TableHead>
              <TableHead>Coin</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Notional</TableHead>
              <TableHead className="text-right max-lg:hidden">Size</TableHead>
              <TableHead className="text-right max-md:hidden">Fee</TableHead>
              <TableHead className="max-lg:hidden">Method</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liquidations.map((liq: Liquidation) => (
              <TableRow key={liq.tid} className="hover:bg-white/[0.02]">
                <TableCell className="text-sm text-white font-medium">
                  {formatDateTime(liq.time, dateFormat)}
                </TableCell>
                <TableCell className="text-sm text-brand-accent font-medium">
                  {liq.coin}
                </TableCell>
                <TableCell className="text-sm">
                  <StatusBadge variant={liq.liq_dir === 'Long' ? 'success' : 'error'}>
                    {liq.liq_dir}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-sm text-right text-white font-medium">
                  ${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-sm text-right text-white font-medium max-lg:hidden">
                  {formatNumber(liq.size_total, format, { maximumFractionDigits: 4 })}
                </TableCell>
                <TableCell className="text-sm text-right text-text-muted max-md:hidden">
                  ${formatNumber(liq.fee_total_liquidated, format, { maximumFractionDigits: 4 })}
                </TableCell>
                <TableCell className="text-sm text-text-secondary max-lg:hidden">
                  {liq.method}
                </TableCell>
                <TableCell className="text-sm">
                  <AddressDisplay address={liq.liquidated_user} />
                </TableCell>
                <TableCell className="text-sm">
                  <AddressDisplay address={liq.hash} showExternalLink={true} showCopy={true} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
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
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>TVL</TableHead>
            <TableHead className="text-right">APR</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaults.map((vault: VaultSummary) => (
            <TableRow key={vault.summary.vaultAddress} className="hover:bg-white/[0.02]">
              <TableCell className="text-sm text-white font-medium">{vault.summary.name}</TableCell>
              <TableCell className="text-sm">
                <StatusBadge variant={!vault.summary.isClosed ? 'success' : 'error'}>
                  {!vault.summary.isClosed ? 'Open' : 'Closed'}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-sm text-white font-medium">
                ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className={`text-right font-medium ${vault.apr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </TableCell>
              <TableCell className="text-sm">
                <AddressDisplay address={vault.summary.leader} />
              </TableCell>
              <TableCell className="text-sm text-white font-medium">
                {formatDate(vault.summary.createTimeMillis, dateFormat)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  );
} 