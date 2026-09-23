import { type ReactNode } from "react";
import { TypedDataTable, ModuleAsset, type Column, type PaginationProps } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatNumber, compactUsd, formatAssetValue } from "@/lib/formatters/numberFormatting";
import { NumberFormatType } from "@/store/number-format.store";
import { ValidatorDelegation } from "@/services/explorer/validator/types/validators";
import {
  FormattedDelegatorHistoryItem,
  FormattedDelegatorRewardItem,
} from "@/services/explorer/validator/types/delegator";

type StakingSubTab = "delegations" | "history" | "rewards";

type StakingPagination = Pick<
  PaginationProps,
  "total" | "page" | "rowsPerPage" | "onPageChange" | "onRowsPerPageChange"
>;

interface StakingTableContentProps {
  activeSubTab: StakingSubTab;
  /** Sub-tabs + balances, rendered in the table toolbar. */
  toolbar: ReactNode;
  /** Controlled pagination shared by the three sub-tables. */
  pagination: StakingPagination;
  delegationsData: {
    delegations: ValidatorDelegation[];
    loading: boolean;
    error: Error | null;
  };
  historyData: {
    history: FormattedDelegatorHistoryItem[];
    loading: boolean;
    error: Error | null;
  };
  rewardsData: {
    rewards: FormattedDelegatorRewardItem[];
    loading: boolean;
    error: Error | null;
  };
  format: NumberFormatType;
  hypePrice: number | null;
}

/** Validator name (when known) over its address; bare address otherwise. */
function ValidatorCell({
  validatorName,
  validator,
}: {
  validatorName?: string;
  validator: string;
}) {
  const hasName = !!validatorName && !validatorName.includes("...");
  if (!hasName) return <AddressDisplay address={validator} />;
  return (
    <ModuleAsset
      logo={validatorName.slice(0, 2).toUpperCase()}
      name={validatorName}
      sub={<AddressDisplay address={validator} />}
    />
  );
}

export function StakingTableContent({
  activeSubTab,
  toolbar,
  pagination,
  delegationsData,
  historyData,
  rewardsData,
  format,
  hypePrice,
}: StakingTableContentProps) {
  const { format: dateFormat } = useDateFormat();

  const hype = (n: number, digits = 2) =>
    `${formatNumber(n, format, { maximumFractionDigits: digits })} HYPE`;
  const usd = (n: number) => (hypePrice ? compactUsd(n * hypePrice) : "—");

  const shared = {
    toolbar,
    density: "compact" as const,
    ...pagination,
    // One page (≤ 10 rows) needs no pager — nor "0–0 of 0" under an empty state.
    paginationVariant: pagination.total > 10 ? ("full" as const) : ("none" as const),
  };

  if (activeSubTab === "delegations") {
    const columns: Column<ValidatorDelegation>[] = [
      {
        key: "validator",
        header: "Validator",
        accessor: (d) => (
          <ValidatorCell validatorName={d.validatorName} validator={d.validator} />
        ),
      },
      {
        key: "amount",
        header: "Amount",
        type: "numeric",
        accessor: (d) => hype(parseFloat(d.amount)),
      },
      {
        key: "value",
        header: "Value",
        type: "numeric",
        accessor: (d) => usd(parseFloat(d.amount)),
      },
      {
        key: "lockedUntil",
        header: "Locked until",
        type: "time",
        align: "right",
        accessor: (d) =>
          d.lockedUntilTimestamp ? formatDateTime(d.lockedUntilTimestamp, dateFormat) : "—",
      },
    ];

    return (
      <TypedDataTable<ValidatorDelegation>
        {...shared}
        data={delegationsData.delegations}
        columns={columns}
        getRowKey={(d, idx) => `${d.validator}-${idx}`}
        isLoading={delegationsData.loading}
        error={delegationsData.error}
        errorTitle="Failed to load delegations"
        emptyMessage="No active delegations found."
        emptyDescription="Start delegating to validators to earn rewards."
      />
    );
  }

  if (activeSubTab === "history") {
    const columns: Column<FormattedDelegatorHistoryItem>[] = [
      {
        key: "hash",
        header: "Hash",
        accessor: (tx) => (
          <AddressDisplay
            address={tx.hash}
            href={`/explorer/transaction/${tx.hash}`}
            copyMessage="Hash copied to clipboard"
          />
        ),
      },
      {
        key: "type",
        header: "Method",
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
        key: "value",
        header: "Value",
        type: "numeric",
        accessor: (tx) => usd(tx.amount),
      },
      {
        key: "validator",
        header: "Validator",
        accessor: (tx) => (
          <ValidatorCell validatorName={tx.validatorName} validator={tx.validator} />
        ),
      },
      {
        key: "timestamp",
        header: "Time",
        type: "time",
        align: "right",
        accessor: (tx) => formatDateTime(tx.timestamp, dateFormat),
      },
    ];

    return (
      <TypedDataTable<FormattedDelegatorHistoryItem>
        {...shared}
        data={historyData.history}
        columns={columns}
        getRowKey={(tx) => tx.hash}
        isLoading={historyData.loading}
        error={historyData.error}
        errorTitle="Failed to load history"
        emptyMessage="No staking history found."
        emptyDescription="Your delegation and undelegation transactions will appear here."
      />
    );
  }

  if (activeSubTab === "rewards") {
    const columns: Column<FormattedDelegatorRewardItem>[] = [
      {
        key: "source",
        header: "Source",
        accessor: (r) => (
          <StatusBadge variant={r.source === "commission" ? "gold" : "success"}>
            {r.source === "commission" ? "Commission" : "Delegation"}
          </StatusBadge>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        type: "numeric",
        tone: () => "success",
        accessor: (r) => hype(r.amount, 6),
      },
      {
        key: "value",
        header: "Value",
        type: "numeric",
        // Daily rewards are tiny: keep sub-cent precision (compact would read $0.00).
        accessor: (r) => (hypePrice ? formatAssetValue(r.amount * hypePrice, format) : "—"),
      },
      {
        key: "time",
        header: "Time",
        type: "time",
        align: "right",
        accessor: (r) => formatDateTime(r.timestamp, dateFormat),
      },
    ];

    return (
      <TypedDataTable<FormattedDelegatorRewardItem>
        {...shared}
        data={rewardsData.rewards}
        columns={columns}
        getRowKey={(r, idx) => `${r.source}-${r.timestamp}-${idx}`}
        isLoading={rewardsData.loading}
        error={rewardsData.error}
        errorTitle="Failed to load rewards"
        emptyMessage="No staking rewards found."
        emptyDescription="Delegate to validators to start earning commission and delegation rewards."
      />
    );
  }

  return null;
}
