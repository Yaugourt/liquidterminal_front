import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { NumberFormatType } from "@/store/number-format.store";
import { Validator } from "@/services/explorer/validator/types/validators";
import {
  FormattedStakingValidation,
  FormattedUnstakingQueueItem,
} from "@/services/explorer/validator/types/staking";
import { VaultSummary } from "@/services/explorer/vault/types";
import { Liquidation } from "@/services/explorer/liquidation";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useDateFormat } from "@/store/date-format.store";
import { formatDate, formatDateTime } from "@/lib/formatters/dateFormatting";
import { PaginationProps } from "@/components/common";

interface TableContentProps {
  activeTab: string;
  validatorSubTab: string;
  onValidatorSubTabChange: (subTab: "all" | "transactions" | "unstaking") => void;
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
  pagination,
}: TableContentProps) {
  const { validators, loading: validatorsLoading, error: validatorsError } = validatorsData;
  const { vaults, loading: vaultsLoading, error: vaultsError } = vaultsData;
  const {
    validations: stakingValidations,
    loading: stakingLoading,
    error: stakingError,
  } = stakingData;
  const {
    unstakingQueue,
    loading: unstakingLoading,
    error: unstakingError,
  } = unstakingData;
  const {
    liquidations,
    loading: liquidationsLoading,
    error: liquidationsError,
  } = liquidationsData;
  const { format: dateFormat } = useDateFormat();

  const getValidatorName = (validatorAddress: string) => {
    const validator = validators.find(
      (v: Validator) => v.address === validatorAddress || v.validator === validatorAddress
    );
    return validator
      ? validator.name
      : `${validatorAddress.slice(0, 6)}...${validatorAddress.slice(-4)}`;
  };

  // ── Validators tab ──────────────────────────────────────────────────────
  if (activeTab === "validators") {
    const validatorsSlice = validators.slice(startIndex, endIndex);

    if (validatorSubTab === "all") {
      const columns: Column<Validator>[] = [
        {
          key: "name",
          header: "Name",
          accessor: (v) => (
            <span className="text-sm text-brand font-medium">{v.name}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          accessor: (v) => (
            <StatusBadge variant={v.isActive ? "success" : "error"}>
              {v.isActive ? "Active" : "Inactive"}
            </StatusBadge>
          ),
        },
        {
          key: "stake",
          header: "Staked HYPE",
          type: "numeric",
          accessor: (v) => (
            <span className="font-medium">
              {formatNumber(v.stake, format, { maximumFractionDigits: 2 })}
            </span>
          ),
        },
        {
          key: "apr",
          header: "APR",
          type: "numeric",
          accessor: (v) => (
            <span className="text-success font-medium">
              {formatNumber(v.apr, format, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%
            </span>
          ),
        },
        {
          key: "commission",
          header: "Commission",
          type: "numeric",
          accessor: (v) => (
            <span className="font-medium">
              {formatNumber(v.commission, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}%
            </span>
          ),
        },
        {
          key: "uptime",
          header: "Uptime",
          type: "numeric",
          accessor: (v) => (
            <span className="font-medium">
              {formatNumber(v.uptime, format, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%
            </span>
          ),
        },
        {
          key: "nRecentBlocks",
          header: "Recent Blocks",
          type: "numeric",
          accessor: (v) => (
            <span className="text-brand font-medium">
              {formatNumber(v.nRecentBlocks, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          ),
        },
      ];

      return (
        <TypedDataTable<Validator>
          data={validatorsSlice}
          columns={columns}
          getRowKey={(v) => v.name}
          isLoading={validatorsLoading}
          error={validatorsError}
          errorTitle="Failed to load validators"
          emptyMessage="No validators available"
          paginationVariant={pagination ? "full" : "none"}
          total={pagination?.total}
          page={pagination?.page}
          rowsPerPage={pagination?.rowsPerPage}
          onPageChange={pagination?.onPageChange}
          onRowsPerPageChange={pagination?.onRowsPerPageChange}
          rowsPerPageOptions={pagination?.rowsPerPageOptions}
        />
      );
    }

    if (validatorSubTab === "transactions") {
      const columns: Column<FormattedStakingValidation>[] = [
        {
          key: "timestamp",
          header: "Time",
          accessor: (tx) => (
            <span className="font-medium">
              {formatDateTime(tx.timestamp, dateFormat)}
            </span>
          ),
        },
        {
          key: "user",
          header: "User",
          accessor: (tx) => <AddressDisplay address={tx.user} />,
        },
        {
          key: "type",
          header: "Type",
          accessor: (tx) => (
            <StatusBadge variant={tx.type === "Undelegate" ? "error" : "success"}>
              {tx.type}
            </StatusBadge>
          ),
        },
        {
          key: "amount",
          header: "Amount",
          type: "numeric",
          accessor: (tx) => (
            <span className="font-medium">
              {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
            </span>
          ),
        },
        {
          key: "validator",
          header: "Validator",
          accessor: (tx) => (
            <AddressDisplay
              address={tx.validator}
              label={getValidatorName(tx.validator)}
            />
          ),
        },
        {
          key: "hash",
          header: "Hash",
          accessor: (tx) => (
            <AddressDisplay address={tx.hash} showExternalLink showCopy />
          ),
        },
      ];

      return (
        <TypedDataTable<FormattedStakingValidation>
          data={stakingValidations ?? []}
          columns={columns}
          getRowKey={(tx) => tx.hash}
          isLoading={stakingLoading}
          error={stakingError}
          errorTitle="Failed to load transactions"
          emptyMessage="No transactions available"
          paginationVariant={pagination ? "full" : "none"}
          total={pagination?.total}
          page={pagination?.page}
          rowsPerPage={pagination?.rowsPerPage}
          onPageChange={pagination?.onPageChange}
          onRowsPerPageChange={pagination?.onRowsPerPageChange}
          rowsPerPageOptions={pagination?.rowsPerPageOptions}
        />
      );
    }

    if (validatorSubTab === "unstaking") {
      const columns: Column<FormattedUnstakingQueueItem>[] = [
        {
          key: "timestamp",
          header: "Time",
          accessor: (item) => (
            <span className="font-medium">
              {formatDateTime(item.timestamp, dateFormat)}
            </span>
          ),
        },
        {
          key: "user",
          header: "User",
          accessor: (item) => <AddressDisplay address={item.user} />,
        },
        {
          key: "amount",
          header: "Amount",
          type: "numeric",
          accessor: (item) => (
            <span className="font-medium">
              {formatNumber(item.amount, format, { maximumFractionDigits: 2 })} HYPE
            </span>
          ),
        },
      ];

      return (
        <TypedDataTable<FormattedUnstakingQueueItem>
          data={unstakingQueue ?? []}
          columns={columns}
          getRowKey={(item, idx) => `${item.user}-${item.timestamp}-${idx}`}
          isLoading={unstakingLoading}
          error={unstakingError}
          errorTitle="Failed to load unstaking queue"
          emptyMessage="No pending unstaking requests"
          paginationVariant={pagination ? "full" : "none"}
          total={pagination?.total}
          page={pagination?.page}
          rowsPerPage={pagination?.rowsPerPage}
          onPageChange={pagination?.onPageChange}
          onRowsPerPageChange={pagination?.onRowsPerPageChange}
          rowsPerPageOptions={pagination?.rowsPerPageOptions}
        />
      );
    }

    return null;
  }

  // ── Liquidations tab ────────────────────────────────────────────────────
  if (activeTab === "liquidations") {
    const columns: Column<Liquidation>[] = [
      {
        key: "time",
        header: "Time",
        accessor: (liq) => (
          <span className="font-medium">
            {formatDateTime(liq.time, dateFormat)}
          </span>
        ),
      },
      {
        key: "coin",
        header: "Coin",
        accessor: (liq) => (
          <span className="text-brand font-medium">{liq.coin}</span>
        ),
      },
      {
        key: "side",
        header: "Side",
        accessor: (liq) => (
          <StatusBadge variant={liq.liq_dir === "Long" ? "success" : "error"}>
            {liq.liq_dir}
          </StatusBadge>
        ),
      },
      {
        key: "notional",
        header: "Notional",
        type: "numeric",
        accessor: (liq) => (
          <span className="font-medium">
            ${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        key: "size",
        header: "Size",
        type: "numeric",
        className: "max-lg:hidden",
        accessor: (liq) => (
          <span className="font-medium">
            {formatNumber(liq.size_total, format, { maximumFractionDigits: 4 })}
          </span>
        ),
      },
      {
        key: "fee",
        header: "Fee",
        type: "numeric",
        className: "max-md:hidden",
        accessor: (liq) => (
          <span className="text-text-tertiary">
            ${formatNumber(liq.fee_total_liquidated, format, { maximumFractionDigits: 4 })}
          </span>
        ),
      },
      {
        key: "method",
        header: "Method",
        className: "max-lg:hidden",
        accessor: (liq) => (
          <span className="text-text-secondary">{liq.method}</span>
        ),
      },
      {
        key: "user",
        header: "User",
        accessor: (liq) => <AddressDisplay address={liq.liquidated_user} />,
      },
      {
        key: "hash",
        header: "Hash",
        accessor: (liq) => (
          <AddressDisplay address={liq.hash} showExternalLink showCopy />
        ),
      },
    ];

    return (
      <TypedDataTable<Liquidation>
        data={liquidations}
        columns={columns}
        getRowKey={(liq) => liq.tid}
        isLoading={liquidationsLoading}
        error={liquidationsError}
        errorTitle="Failed to load liquidations"
        emptyMessage="No liquidations available"
        paginationVariant={pagination ? "full" : "none"}
        total={pagination?.total}
        page={pagination?.page}
        rowsPerPage={pagination?.rowsPerPage}
        onPageChange={pagination?.onPageChange}
        onRowsPerPageChange={pagination?.onRowsPerPageChange}
        rowsPerPageOptions={pagination?.rowsPerPageOptions}
      />
    );
  }

  // ── Vaults tab (default) ─────────────────────────────────────────────────
  const vaultColumns: Column<VaultSummary>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (v) => (
        <span className="font-medium">{v.summary.name}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (v) => (
        <StatusBadge variant={!v.summary.isClosed ? "success" : "error"}>
          {!v.summary.isClosed ? "Open" : "Closed"}
        </StatusBadge>
      ),
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      accessor: (v) => (
        <span className="font-medium">
          ${formatNumber(parseFloat(v.summary.tvl), format, { maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "apr",
      header: "APR",
      type: "numeric",
      accessor: (v) => (
        <span className={`font-medium ${v.apr >= 0 ? "text-success" : "text-danger"}`}>
          {formatNumber(v.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </span>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      accessor: (v) => <AddressDisplay address={v.summary.leader} />,
    },
    {
      key: "created",
      header: "Created",
      accessor: (v) => (
        <span className="font-medium">
          {formatDate(v.summary.createTimeMillis, dateFormat)}
        </span>
      ),
    },
  ];

  return (
    <TypedDataTable<VaultSummary>
      data={vaults}
      columns={vaultColumns}
      getRowKey={(v) => v.summary.vaultAddress}
      isLoading={vaultsLoading}
      error={vaultsError}
      errorTitle="Failed to load vaults"
      emptyMessage="No vaults available"
      paginationVariant={pagination ? "full" : "none"}
      total={pagination?.total}
      page={pagination?.page}
      rowsPerPage={pagination?.rowsPerPage}
      onPageChange={pagination?.onPageChange}
      onRowsPerPageChange={pagination?.onRowsPerPageChange}
      rowsPerPageOptions={pagination?.rowsPerPageOptions}
    />
  );
}
