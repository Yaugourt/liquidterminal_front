"use client";

import { useCallback, type ReactNode } from "react";
import { TypedDataTable, ModuleAsset, CellValue, CellBar, type Column } from "@/components/common";
import { compactUsd, formatNumber, formatFunding } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

function buildColumns(format: NumberFormatType): Column<PerpDexWithMarketData>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      getSortValue: (row) => row.name.toLowerCase(),
      accessor: (row) => (
        <ModuleAsset logo={row.name.charAt(0).toUpperCase()} name={row.fullName} sub={row.name} />
      ),
    },
    {
      key: "activeAssets",
      className: "whitespace-nowrap",
      header: "Markets",
      align: "right",
      sortable: true,
      getSortValue: (row) => row.activeAssets,
      accessor: (row) => (
        <CellValue
          value={row.activeAssets}
          sub={
            row.activeAssets !== row.totalAssets
              ? `+${row.totalAssets - row.activeAssets} delisted`
              : undefined
          }
          subTone="danger"
        />
      ),
    },
    {
      key: "totalVolume24h",
      header: "24h Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalVolume24h,
      accessor: (row) =>
        row.totalVolume24h > 0
          ? compactUsd(row.totalVolume24h)
          : '-',
    },
    {
      key: "totalOpenInterest",
      className: "hidden md:table-cell",
      header: "Open Interest",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalOpenInterest,
      accessor: (row) =>
        row.totalOpenInterest > 0
          ? compactUsd(row.totalOpenInterest)
          : '-',
    },
    {
      key: "avgFunding",
      className: "hidden md:table-cell",
      header: "Avg Funding",
      type: "change",
      sortable: true,
      getSortValue: (row) => row.avgFunding,
      tone: (row) => (row.avgFunding === 0 ? "muted" : undefined),
      accessor: (row) => (row.avgFunding !== 0 ? formatFunding(row.avgFunding) : '-'),
    },
    {
      key: "totalOiCap",
      className: "hidden xl:table-cell",
      header: "OI Cap",
      align: "right",
      accessor: (row) => {
        const cap = formatNumber(row.totalOiCap, format, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          currency: '$',
          showCurrency: true,
        });
        if (!(row.totalOpenInterest > 0 && row.totalOiCap > 0)) return <CellValue value={cap} />;
        const used = (row.totalOpenInterest / row.totalOiCap) * 100;
        return (
          <CellBar value={used / 100} width={48} label={<CellValue value={cap} sub={`${used.toFixed(1)}% used`} />} />
        );
      },
    },
  ];
}

interface PerpDexTableProps {
  /** Strip under the head (view switcher owned by the page). */
  toolbar?: ReactNode;
}

export function PerpDexTable({ toolbar }: PerpDexTableProps = {}) {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { dexs, isLoading } = usePerpDexMarketData();

  const handleDexClick = useCallback(
    (dex: PerpDexWithMarketData) => {
      router.push(`/market/perpdex/${encodeURIComponent(dex.name)}`);
    },
    [router]
  );

  return (
    <TypedDataTable<PerpDexWithMarketData>
      data={dexs}
      columns={buildColumns(format)}
      getRowKey={(row) => row.name}
      isLoading={isLoading && dexs.length === 0}
      emptyMessage="No PerpDex available"
      emptyDescription="Check back later"
      onRowClick={handleDexClick}
      rowMotion
      initialSort={{ field: "totalVolume24h", direction: "desc" }}
      toolbar={toolbar}
    />
  );
}
