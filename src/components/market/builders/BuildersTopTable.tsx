"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { BuilderIdentity, resolveBuilderLabel } from "./BuilderIdentity";

interface BuildersTopTableProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
  /** View switcher + window meta, rendered in the table toolbar (owned by the page). */
  toolbar?: ReactNode;
}

const PAGE_SIZE = 25;

/** Column config — the V4 look (mono, fees gold, density) is encoded by TypedDataTable. */
function buildColumns(format: NumberFormatType): Column<BuilderTopRow>[] {
  return [
    {
      key: "rank",
      header: "#",
      type: "rank",
      width: "50px",
      accessor: (_row, _idx, abs) => abs + 1,
    },
    {
      key: "name",
      header: "Builder",
      sortable: true,
      // Sort on what the row actually reads as — the curated brand when we have
      // one, so "Phantom" no longer sorts under the raw PURPS code.
      getSortValue: (row) => resolveBuilderLabel(row.builder, row.builderName).label.toLowerCase(),
      accessor: (row) => <BuilderIdentity address={row.builder} name={row.builderName} />,
    },
    {
      key: "totalVolume",
      header: "Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalVolume ?? 0,
      accessor: (row) =>
        formatNumber(row.totalVolume, format, {
          maximumFractionDigits: 0,
          currency: "$",
          showCurrency: true,
        }),
    },
    {
      key: "totalBuilderFees",
      header: "Builder Fees",
      type: "fees",
      sortable: true,
      className: "hidden sm:table-cell",
      getSortValue: (row) => row.totalBuilderFees ?? 0,
      accessor: (row) =>
        formatNumber(row.totalBuilderFees, format, {
          maximumFractionDigits: 2,
          currency: "$",
          showCurrency: true,
        }),
    },
    {
      key: "uniqueUsers",
      header: "Users",
      type: "numeric",
      sortable: true,
      className: "hidden md:table-cell",
      tone: () => "muted",
      getSortValue: (row) => row.uniqueUsers ?? 0,
      accessor: (row) => formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 }),
    },
    {
      key: "fillCount",
      header: "Fills",
      type: "numeric",
      sortable: true,
      className: "hidden lg:table-cell",
      tone: () => "muted",
      getSortValue: (row) => row.fillCount ?? 0,
      accessor: (row) => formatNumber(row.fillCount, format, { maximumFractionDigits: 0 }),
    },
  ];
}

export function BuildersTopTable({ rows, isLoading, error, onRetry, toolbar }: BuildersTopTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();

  return (
    <TypedDataTable<BuilderTopRow>
      data={rows}
      columns={buildColumns(format)}
      getRowKey={(row) => row.builder}
      isLoading={isLoading && rows.length === 0}
      error={error}
      onErrorRetry={onRetry}
      errorTitle="Failed to load top builders"
      emptyMessage="No builders"
      emptyDescription="No builder data for this window."
      rowMotion
      onRowClick={(row) =>
        router.push(`/market/builders/${encodeURIComponent(row.builder)}`)
      }
      paginate
      itemsPerPage={PAGE_SIZE}
      initialSort={{ field: "totalVolume", direction: "desc" }}
      paginationVariant={rows.length > PAGE_SIZE ? "full" : "none"}
      rowsPerPageOptions={[25]}
      toolbar={toolbar}
    />
  );
}
