import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  toTradeSide,
  type Column,
} from "@/components/common";
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
import { formatNumber, truncateAddress } from "@/lib/formatters/numberFormatting";
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

/** Tx hash cell — links to the transaction page (not the address page). */
function TxHash({ hash }: { hash: string }) {
  return (
    <AddressDisplay
      address={hash}
      href={`/explorer/transaction/${hash}`}
      copyMessage="Hash copied to clipboard"
    />
  );
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

  const hype = (n: number) => `${formatNumber(n, format, { maximumFractionDigits: 2 })} HYPE`;

  const getValidatorName = (validatorAddress: string) => {
    const validator = validators.find(
      (v: Validator) => v.address === validatorAddress || v.validator === validatorAddress
    );
    return validator ? validator.name : truncateAddress(validatorAddress);
  };

  // ── Validators tab ──────────────────────────────────────────────────────
  if (activeTab === "validators") {
    const validatorsSlice = validators.slice(startIndex, endIndex);

    if (validatorSubTab === "all") {
      const pct = (n: number, digits: number) =>
        `${formatNumber(n, format, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

      const columns: Column<Validator>[] = [
        {
          key: "name",
          header: "Name",
          accessor: (v) => (
            <ModuleAsset
              logo={v.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?"}
              name={v.name}
              sub={truncateAddress(v.validator)}
            />
          ),
        },
        {
          key: "status",
          header: "Status",
          accessor: (v) => (
            <StatusBadge variant={v.isActive ? "success" : "inactive"}>
              {v.isActive ? "Active" : "Inactive"}
            </StatusBadge>
          ),
        },
        {
          key: "stake",
          header: "Staked HYPE",
          type: "numeric",
          accessor: (v) => formatNumber(v.stake, format, { maximumFractionDigits: 2 }),
        },
        {
          key: "apr",
          header: "APR",
          type: "numeric",
          tone: () => "success",
          accessor: (v) => pct(v.apr, 2),
        },
        {
          key: "commission",
          header: "Commission",
          type: "fees",
          accessor: (v) => pct(v.commission, 0),
        },
        {
          key: "uptime",
          header: "Uptime",
          type: "numeric",
          accessor: (v) => pct(v.uptime, 2),
        },
        {
          key: "nRecentBlocks",
          header: "Recent Blocks",
          type: "numeric",
          accessor: (v) =>
            formatNumber(v.nRecentBlocks, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
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
          density="compact"
        />
      );
    }

    if (validatorSubTab === "transactions") {
      const columns: Column<FormattedStakingValidation>[] = [
        {
          key: "timestamp",
          header: "Time",
          type: "time",
          accessor: (tx) => formatDateTime(tx.timestamp, dateFormat),
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
            <StatusBadge variant={tx.type === "Undelegate" ? "sell" : "buy"}>{tx.type}</StatusBadge>
          ),
        },
        {
          key: "amount",
          header: "Amount",
          type: "numeric",
          accessor: (tx) => hype(tx.amount),
        },
        {
          key: "validator",
          header: "Validator",
          accessor: (tx) => (
            <AddressDisplay address={tx.validator} label={getValidatorName(tx.validator)} />
          ),
        },
        {
          key: "hash",
          header: "Hash",
          accessor: (tx) => <TxHash hash={tx.hash} />,
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
          density="compact"
        />
      );
    }

    if (validatorSubTab === "unstaking") {
      const columns: Column<FormattedUnstakingQueueItem>[] = [
        {
          key: "timestamp",
          header: "Time",
          type: "time",
          accessor: (item) => formatDateTime(item.timestamp, dateFormat),
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
          accessor: (item) => hype(item.amount),
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
          density="compact"
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
        type: "time",
        accessor: (liq) => formatDateTime(liq.time, dateFormat),
      },
      {
        key: "coin",
        header: "Coin",
        accessor: (liq) => <ModuleAsset assetName={liq.coin} name={liq.coin} />,
      },
      {
        key: "side",
        header: "Side",
        accessor: (liq) => {
          const side = toTradeSide(liq.liq_dir);
          return side ? <SideBadge side={side} /> : "—";
        },
      },
      {
        key: "notional",
        header: "Notional",
        type: "numeric",
        accessor: (liq) => `$${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}`,
      },
      {
        key: "size",
        header: "Size",
        type: "numeric",
        className: "max-lg:hidden",
        accessor: (liq) => formatNumber(liq.size_total, format, { maximumFractionDigits: 4 }),
      },
      {
        key: "fee",
        header: "Fee",
        type: "numeric",
        tone: () => "muted",
        className: "max-md:hidden",
        accessor: (liq) =>
          `$${formatNumber(liq.fee_total_liquidated, format, { maximumFractionDigits: 4 })}`,
      },
      {
        key: "method",
        header: "Method",
        className: "max-lg:hidden",
        accessor: (liq) => <StatusBadge variant="neutral">{liq.method}</StatusBadge>,
      },
      {
        key: "user",
        header: "User",
        accessor: (liq) => <AddressDisplay address={liq.liquidated_user} />,
      },
      {
        key: "hash",
        header: "Hash",
        accessor: (liq) => <TxHash hash={liq.hash} />,
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
        density="compact"
      />
    );
  }

  // ── Vaults tab (default) ─────────────────────────────────────────────────
  const vaultColumns: Column<VaultSummary>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (v) => (
        <ModuleAsset
          logo={v.summary.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?"}
          name={v.summary.name}
          sub={truncateAddress(v.summary.vaultAddress)}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (v) => (
        <StatusBadge variant={!v.summary.isClosed ? "success" : "inactive"}>
          {!v.summary.isClosed ? "Open" : "Closed"}
        </StatusBadge>
      ),
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      accessor: (v) =>
        `$${formatNumber(parseFloat(v.summary.tvl), format, { maximumFractionDigits: 2 })}`,
    },
    {
      key: "apr",
      header: "APR",
      type: "change",
      getSortValue: (v) => v.apr,
      accessor: (v) =>
        `${formatNumber(v.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    },
    {
      key: "leader",
      header: "Leader",
      accessor: (v) => <AddressDisplay address={v.summary.leader} />,
    },
    {
      key: "created",
      header: "Created",
      type: "time",
      align: "right",
      accessor: (v) => formatDate(v.summary.createTimeMillis, dateFormat),
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
      density="compact"
    />
  );
}
