"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TransactionListProps } from "@/components/types/explorer.types";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  formatHash,
  isHip2Address,
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
 * Renders a single "from" / "to" address cell, handling special markers
 * (Spot / Perp / Staking / Arbitrum / HIP2) the same way the legacy row did.
 */
function AddressCell({
  address,
  currentAddress,
}: {
  address: string;
  currentAddress?: string;
}) {
  if (!address) return <span className="text-text-primary">-</span>;

  if (["Spot", "Perp", "Staking"].includes(address)) {
    return <span className="text-text-primary">{address}</span>;
  }

  if (address === "Arbitrum") {
    return (
      <Link
        href={`https://arbiscan.io/address/${currentAddress}#tokentxns`}
        className="text-brand hover:text-brand/80 truncate block"
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
        className="text-brand hover:text-brand/80 truncate block"
      >
        HIP2
      </Link>
    );
  }

  const isCurrent =
    !!currentAddress &&
    address.toLowerCase() === currentAddress.toLowerCase();

  return (
    <AddressDisplay
      address={address}
      showCopy={isCurrent}
      showExternalLink={false}
      className={isCurrent ? "text-text-primary" : "text-brand"}
      href={isCurrent ? undefined : `/explorer/address/${address}`}
    />
  );
}

/**
 * Hash cell with click-to-copy button. Local state keeps copy feedback
 * isolated per row.
 */
function HashCell({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently ignore clipboard errors.
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/transaction/${hash}`}
        prefetch={false}
        className="text-brand hover:text-text-primary transition-colors"
        title={hash}
      >
        {formatHash(hash)}
      </Link>
      <button
        onClick={copy}
        className="group text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded-md hover:bg-white/10"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );
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
        accessor: (tx) => <HashCell hash={tx.hash} />,
      },
      {
        key: "method",
        header: "Method",
        accessor: (tx) =>
          tx.method === "accountClassTransfer" ||
          tx.method === "cStakingTransfer"
            ? "Internal Transfer"
            : tx.method,
      },
      {
        key: "age",
        header: "Age",
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
        header: "Token",
        accessor: (tx) => (
          <span className={getAmountColorClass(tx, formatterConfig)}>
            {formatAmountWithDirection(tx, formatterConfig)}
          </span>
        ),
      },
      {
        key: "price",
        header: "Price",
        align: "right",
        accessor: (tx) => {
          const tokenName = getTokenName(tx.token, spotTokens, perpMarkets);
          const tokenPrice = getTokenPrice(tokenName, spotTokens);
          if (tx.price) {
            return formatNumber(parseFloat(tx.price), format, {
              currency: "$",
              showCurrency: true,
              minimumFractionDigits: 4,
            });
          }
          if (tokenPrice > 0) {
            return formatNumber(tokenPrice, format, {
              currency: "$",
              showCurrency: true,
              minimumFractionDigits: 4,
            });
          }
          return "-";
        },
      },
      {
        key: "value",
        header: "Value",
        align: "right",
        accessor: (tx) => calculateValueWithDirection(tx, formatterConfig),
      },
    ],
    [currentAddress, formatterConfig, format, spotTokens, perpMarkets]
  );

  return (
    <TypedDataTable<TransactionType>
      data={paginatedTxs}
      columns={columns}
      getRowKey={(tx) => tx.hash}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load transactions"
      emptyMessage="No transactions found"
      emptyDescription=""
      density="comfortable"
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={(n) => {
        setRowsPerPage(n);
        setPage(0);
      }}
      paginationDisabled={isLoading}
      className="max-h-[600px] bg-surface/60 border border-border-subtle rounded-2xl"
    />
  );
}
