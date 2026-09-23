"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TransactionListProps } from "@/components/types/explorer.types";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { TypedDataTable, type Column, type CellTone } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import {
  isHip2Address,
  isNullHash,
  getTokenPrice,
  getTokenName,
  calculateValueWithDirection,
  formatAmountWithDirection,
  getAmountColorClass,
  type TransactionType,
} from "@/services/explorer/address";
import type { SpotToken } from "@/services/market/spot/types";
import type { PerpMarketData } from "@/services/market/perp/types";

interface FormatterConfig {
  spotTokens?: SpotToken[];
  perpMarkets?: PerpMarketData[];
  format: NumberFormatType;
  currentAddress?: string;
}

/**
 * "From" / "to" cell: Arbitrum + HIP-2 as links, real addresses via
 * `AddressDisplay`, anything else (Spot / Perp / Staking, "limit") as text.
 */
function AddressCell({
  address,
  currentAddress,
}: {
  address: string;
  currentAddress?: string;
}) {
  if (!address) return <span className="text-text-tertiary">—</span>;


  if (address === "Arbitrum") {
    return (
      <Link
        href={`https://arbiscan.io/address/${currentAddress}#tokentxns`}
        className="text-brand hover:text-brand-hover transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {address}
      </Link>
    );
  }

  if (isHip2Address(address)) {
    return (
      <Link
        href={`/explorer/address/${address}`}
        className="text-brand hover:text-brand-hover transition-colors"
      >
        HIP2
      </Link>
    );
  }

  // Venue markers (Spot / Perp / Staking) and order kinds ("limit") — not addresses.
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return <span className="text-text-secondary">{address}</span>;
  }

  const isCurrent =
    !!currentAddress &&
    address.toLowerCase() === currentAddress.toLowerCase();

  return <AddressDisplay address={address} showCopy={isCurrent} />;
}

/** Sign of a transaction amount, read off the direction-aware display string. */
function amountTone(display: string, colorClass: string): CellTone | undefined {
  if (display === "-") return "muted";
  if (colorClass.includes("success")) return "success";
  if (colorClass.includes("danger")) return "danger";
  return undefined;
}

export function AddressTransactionList({
  transactions,
  isLoading,
  error,
  currentAddress,
}: TransactionListProps) {
  const { format } = useNumberFormat();
  const { data: spotTokens } = useSpotTokens({ limit: 100 });
  const { data: perpMarkets } = usePerpMarkets({ limit: 1000 });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatterConfig: FormatterConfig = useMemo(
    () => ({ spotTokens, perpMarkets, format, currentAddress }),
    [spotTokens, perpMarkets, format, currentAddress]
  );

  const total = transactions?.length ?? 0;
  const paginatedTxs = useMemo(
    () => transactions?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) ?? [],
    [transactions, page, rowsPerPage]
  );

  const columns: Column<TransactionType>[] = useMemo(
    () => [
      {
        key: "hash",
        header: "Hash",
        // System rows (TWAP slices, liquidation-engine fills) carry a null hash — no tx to open.
        accessor: (tx) =>
          isNullHash(tx.hash) ? (
            <span className="text-text-tertiary">—</span>
          ) : (
            <AddressDisplay
              address={tx.hash}
              href={`/explorer/transaction/${tx.hash}`}
              copyMessage="Hash copied to clipboard"
            />
          ),
      },
      {
        key: "method",
        header: "Method",
        type: "text",
        accessor: (tx) =>
          tx.method === "accountClassTransfer" ||
          tx.method === "cStakingTransfer"
            ? "Internal Transfer"
            : tx.method,
      },
      {
        key: "age",
        header: "Age",
        type: "time",
        accessor: (tx) => tx.age,
      },
      {
        key: "from",
        header: "From",
        accessor: (tx) => (
          <AddressCell address={tx.from} currentAddress={currentAddress} />
        ),
      },
      {
        key: "to",
        header: "To",
        accessor: (tx) => (
          <AddressCell address={tx.to} currentAddress={currentAddress} />
        ),
      },
      {
        key: "token",
        header: "Amount",
        type: "numeric",
        accessor: (tx) => formatAmountWithDirection(tx, formatterConfig),
        tone: (tx) =>
          amountTone(
            formatAmountWithDirection(tx, formatterConfig),
            getAmountColorClass(tx, formatterConfig)
          ),
      },
      {
        key: "price",
        header: "Price",
        type: "numeric",
        accessor: (tx) => {
          const tokenName = getTokenName(tx.token, spotTokens, perpMarkets);
          const price = tx.price ? parseFloat(tx.price) : getTokenPrice(tokenName, spotTokens);
          return price > 0 ? formatPrice(price, format) : "—";
        },
      },
      {
        key: "value",
        header: "Value",
        type: "numeric",
        accessor: (tx) => calculateValueWithDirection(tx, formatterConfig),
      },
    ],
    [currentAddress, formatterConfig, format, spotTokens, perpMarkets]
  );

  return (
    <TypedDataTable<TransactionType>
      data={paginatedTxs}
      columns={columns}
      getRowKey={(tx) => tx.id}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load transactions"
      emptyMessage="No transactions found"
      emptyDescription=""
      density="compact"
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={(n) => {
        setRowsPerPage(n);
        setPage(0);
      }}
      paginationDisabled={isLoading}
      className="max-h-[600px]"
    />
  );
}
