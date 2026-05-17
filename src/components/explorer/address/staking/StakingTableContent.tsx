import { TypedDataTable, type Column } from "@/components/common";
import { CopyButton } from "@/components/ui/copy-button";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { NumberFormatType } from "@/store/number-format.store";
import { ValidatorDelegation } from "@/services/explorer/validator/types/validators";
import {
  FormattedDelegatorHistoryItem,
  FormattedDelegatorRewardItem,
} from "@/services/explorer/validator/types/delegator";

type StakingSubTab = "delegations" | "history" | "rewards";

interface StakingTableContentProps {
  activeSubTab: StakingSubTab;
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

function ValidatorCell({
  validatorName,
  validator,
}: {
  validatorName?: string;
  validator: string;
}) {
  const hasName = !!validatorName && !validatorName.includes("...");
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        {hasName ? (
          <>
            <span className="text-text-primary font-medium text-sm font-inter">
              {validatorName}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-brand-accent text-xs">
                {validator.slice(0, 8)}...{validator.slice(-6)}
              </span>
              <CopyButton text={validator} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-brand-accent text-sm">
              {validator.slice(0, 8)}...{validator.slice(-6)}
            </span>
            <CopyButton text={validator} />
          </div>
        )}
      </div>
    </div>
  );
}

export function StakingTableContent({
  activeSubTab,
  delegationsData,
  historyData,
  rewardsData,
  format,
  hypePrice,
}: StakingTableContentProps) {
  const { format: dateFormat } = useDateFormat();

  if (activeSubTab === "delegations") {
    const columns: Column<ValidatorDelegation>[] = [
      {
        key: "validator",
        header: "Validator",
        accessor: (d) => (
          <ValidatorCell
            validatorName={d.validatorName}
            validator={d.validator}
          />
        ),
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (d) => (
          <span className="text-text-primary">
            {formatNumber(parseFloat(d.amount), format, { maximumFractionDigits: 2 })} HYPE
          </span>
        ),
      },
      {
        key: "value",
        header: "Value",
        accessor: (d) => (
          <span className="text-text-primary">
            {hypePrice
              ? `$${formatNumber(parseFloat(d.amount) * hypePrice, format, { maximumFractionDigits: 2 })}`
              : "-"}
          </span>
        ),
      },
      {
        key: "lockedUntil",
        header: "Locked until",
        accessor: (d) => (
          <span className="text-text-primary">
            {d.lockedUntilTimestamp
              ? formatDateTime(d.lockedUntilTimestamp * 1000, dateFormat)
              : "-"}
          </span>
        ),
      },
    ];

    return (
      <TypedDataTable<ValidatorDelegation>
        data={delegationsData.delegations}
        columns={columns}
        getRowKey={(d, idx) => `${d.validator}-${idx}`}
        isLoading={delegationsData.loading}
        error={delegationsData.error}
        errorTitle="Failed to load delegations"
        emptyMessage="No active delegations found."
        emptyDescription="Start delegating to validators to earn rewards."
        paginationVariant="none"
      />
    );
  }

  if (activeSubTab === "history") {
    const columns: Column<FormattedDelegatorHistoryItem>[] = [
      {
        key: "hash",
        header: "Hash",
        accessor: (tx) => (
          <div className="flex items-center gap-2">
            <span className="text-brand-accent text-sm">
              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
            </span>
            <CopyButton text={tx.hash} />
          </div>
        ),
      },
      {
        key: "type",
        header: "Method",
        accessor: (tx) => (
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              tx.type === "Undelegate"
                ? "bg-rose-400/12 text-rose-400 border border-rose-400/25"
                : "bg-emerald-400/12 text-emerald-400 border border-emerald-400/25"
            }`}
          >
            {tx.type}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (tx) => (
          <span className="text-text-primary">
            {formatNumber(tx.amount, format, { maximumFractionDigits: 2 })} HYPE
          </span>
        ),
      },
      {
        key: "value",
        header: "Value",
        accessor: (tx) => (
          <span className="text-text-primary">
            {hypePrice
              ? `$${formatNumber(tx.amount * hypePrice, format, { maximumFractionDigits: 2 })}`
              : "-"}
          </span>
        ),
      },
      {
        key: "validator",
        header: "Validator",
        accessor: (tx) => (
          <ValidatorCell
            validatorName={tx.validatorName}
            validator={tx.validator}
          />
        ),
      },
      {
        key: "timestamp",
        header: "Time",
        accessor: (tx) => (
          <span className="text-text-primary">
            {formatDateTime(tx.timestamp, dateFormat)}
          </span>
        ),
      },
    ];

    return (
      <TypedDataTable<FormattedDelegatorHistoryItem>
        data={historyData.history}
        columns={columns}
        getRowKey={(tx) => tx.hash}
        isLoading={historyData.loading}
        error={historyData.error}
        errorTitle="Failed to load history"
        emptyMessage="No staking history found."
        emptyDescription="Your delegation and undelegation transactions will appear here."
        paginationVariant="none"
      />
    );
  }

  if (activeSubTab === "rewards") {
    const columns: Column<FormattedDelegatorRewardItem>[] = [
      {
        key: "source",
        header: "Source",
        accessor: (r) => (
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              r.source === "commission"
                ? "bg-brand-gold text-brand-gold border border-brand-gold"
                : "bg-emerald-400/12 text-emerald-400 border border-emerald-400/25"
            }`}
          >
            {r.source === "commission" ? "Commission" : "Delegation"}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (r) => (
          <span className="text-emerald-400">
            {formatNumber(r.amount, format, { maximumFractionDigits: 6 })} HYPE
          </span>
        ),
      },
      {
        key: "value",
        header: "Value",
        accessor: (r) => (
          <span className="text-text-primary">
            {hypePrice
              ? `$${formatNumber(r.amount * hypePrice, format, { maximumFractionDigits: 6 })}`
              : "-"}
          </span>
        ),
      },
      {
        key: "time",
        header: "Time",
        accessor: (r) => (
          <span className="text-text-primary">
            {formatDateTime(r.timestamp, dateFormat)}
          </span>
        ),
      },
    ];

    return (
      <TypedDataTable<FormattedDelegatorRewardItem>
        data={rewardsData.rewards}
        columns={columns}
        getRowKey={(r, idx) => `${r.source}-${r.timestamp}-${idx}`}
        isLoading={rewardsData.loading}
        error={rewardsData.error}
        errorTitle="Failed to load rewards"
        emptyMessage="No staking rewards found."
        emptyDescription="Delegate to validators to start earning commission and delegation rewards."
        paginationVariant="none"
      />
    );
  }

  return null;
}
