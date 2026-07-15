"use client";

import { useRouter } from "next/navigation";
import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { avatarColor } from "@/lib/avatarColor";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

interface BuildersTopTableProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
}

const PAGE_SIZE = 25;

/** Column config — the V4 look (mono, fees gold, density) is encoded by TypedDataTable. */
function buildColumns(format: NumberFormatType): Column<BuilderTopRow>[] {
  return [
    {
      key: "rank",
      header: "#",
      width: "50px",
      accessor: (_row, _idx, abs) => (
        <span className="mono text-[11px] text-text-tertiary">{abs + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Builder",
      sortable: true,
      getSortValue: (row) => formatBuilderDisplayName(row.builderName).toLowerCase(),
      accessor: (row) => {
        const label = formatBuilderDisplayName(row.builderName);
        const isAnonymous = label === "—";
        const displayName = isAnonymous
          ? `${row.builder.slice(0, 6)}…${row.builder.slice(-4)}`
          : label;
        const initial = isAnonymous ? "?" : label.charAt(0).toUpperCase();
        const color = isAnonymous ? null : avatarColor(row.builder);
        return (
          <div className="flex items-center gap-2 min-w-0">
            {color ? (
              <div
                className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-semibold"
                style={{ background: `${color}22`, color }}
              >
                {initial}
              </div>
            ) : (
              <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-semibold bg-surface-3 text-text-secondary">
                {initial}
              </div>
            )}
            <span
              className={`text-xs truncate ${
                isAnonymous ? "mono text-text-secondary" : "text-text-primary font-medium"
              }`}
            >
              {displayName}
            </span>
          </div>
        );
      },
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
      getSortValue: (row) => row.uniqueUsers ?? 0,
      accessor: (row) => (
        <span className="text-text-secondary">
          {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      key: "fillCount",
      header: "Fills",
      type: "numeric",
      sortable: true,
      className: "hidden lg:table-cell",
      getSortValue: (row) => row.fillCount ?? 0,
      accessor: (row) => (
        <span className="text-text-secondary">
          {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
  ];
}

export function BuildersTopTable({ rows, isLoading, error, onRetry }: BuildersTopTableProps) {
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
    />
  );
}
