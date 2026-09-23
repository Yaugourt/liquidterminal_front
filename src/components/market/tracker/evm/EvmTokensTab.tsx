"use client";

import { useMemo } from "react";
import { TypedDataTable, ModuleAsset, TableStat, type Column } from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, formatPrice, compactUsd } from "@/lib/formatters/numberFormatting";
import type { NumberFormatType } from "@/store/number-format.store";
import { useEvmComposition, type EvmToken } from "@/services/market/tracker/hyperfolio";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface EvmTokensTabProps {
  address: string;
}

function buildColumns(format: NumberFormatType): Column<EvmToken>[] {
  return [
    {
      key: "token",
      header: "Token",
      accessor: (t) => <ModuleAsset assetName={t.symbol} src={t.logo} name={t.symbol} sub={t.name} />,
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

  const toolbar = (
    <>
      {error && tokens.length === 0 && (
        <HyperfolioNotice error={error} onRetry={refetch} className="w-full" />
      )}
      <TableStat label="Tokens" value={tokens.length} />
      {composition && <TableStat label="Value" value={compactUsd(composition.totalValue)} />}
    </>
  );

  return (
    <TypedDataTable<EvmToken>
      data={tokens}
      columns={columns}
      getRowKey={(t) => t.address}
      isLoading={isLoading && tokens.length === 0}
      toolbar={toolbar}
      emptyMessage="No HyperEVM tokens"
      emptyDescription="This wallet holds no tokens on HyperEVM."
      initialSort={{ field: "value", direction: "desc" }}
      paginate
      itemsPerPage={10}
      rowsPerPageOptions={[10, 25, 50]}
      paginationVariant="compact"
      density="compact"
    />
  );
}
