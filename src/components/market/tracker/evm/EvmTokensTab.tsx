"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import type { NumberFormatType } from "@/store/number-format.store";
import { useEvmComposition, type EvmToken } from "@/services/market/tracker/hyperfolio";
import { ProtocolAvatar } from "./ProtocolAvatar";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface EvmTokensTabProps {
  address: string;
}

function buildColumns(format: NumberFormatType): Column<EvmToken>[] {
  return [
    {
      key: "token",
      header: "Token",
      accessor: (t) => (
        <span className="inline-flex items-center gap-2 min-w-0">
          <ProtocolAvatar name={t.symbol} logo={t.logo} />
          <span className="min-w-0">
            <span className="block text-text-primary font-semibold truncate">{t.symbol}</span>
            <span className="block text-[11px] text-text-tertiary truncate">{t.name}</span>
          </span>
        </span>
      ),
      sortable: true,
      getSortValue: (t) => t.symbol,
    },
    {
      key: "balance",
      header: "Balance",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.balance,
      accessor: (t) => formatNumber(t.balance, format, { maximumFractionDigits: t.balance >= 1000 ? 2 : 6 }),
    },
    {
      key: "price",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.price,
      accessor: (t) => (t.price > 0 ? formatPrice(t.price, format) : "—"),
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.value,
      accessor: (t) => `$${formatNumber(t.value, format, { maximumFractionDigits: 2 })}`,
    },
  ];
}

/** HyperEVM token balances (Hyperfolio `/wallet/composition`), sorted by value. */
export function EvmTokensTab({ address }: EvmTokensTabProps) {
  const { composition, isLoading, error, refetch } = useEvmComposition(address);
  const { format } = useNumberFormat();
  const columns = useMemo(() => buildColumns(format), [format]);
  const tokens = composition?.tokens ?? [];

  return (
    <div>
      {error && tokens.length === 0 && (
        <div className="p-3.5">
          <HyperfolioNotice error={error} onRetry={refetch} />
        </div>
      )}
      <TypedDataTable<EvmToken>
        data={tokens}
        columns={columns}
        getRowKey={(t) => t.address}
        isLoading={isLoading && tokens.length === 0}
        error={error && tokens.length === 0 ? null : undefined}
        emptyMessage="No HyperEVM tokens"
        emptyDescription="This wallet holds no tokens on HyperEVM."
        initialSort={{ field: "value", direction: "desc" }}
        paginate
        itemsPerPage={10}
        rowsPerPageOptions={[10, 25, 50]}
        paginationVariant="compact"
        headerFill={false}
        density="compact"
      />
    </div>
  );
}
