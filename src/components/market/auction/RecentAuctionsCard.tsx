"use client";

import { TypedDataTable, ModuleAsset, type Column } from "@/components/common";
import { useAuctions } from "@/services/market/auction/hooks/useAuctions";
import type { AuctionInfo } from "@/services/market/auction/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";

/** Les 5 dernières auctions — preview table, à placer à côté de l'AuctionCard. */
export function RecentAuctionsCard() {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const { auctions, isLoading, error } = useAuctions({
    currency: "ALL",
    limit: 5,
    defaultParams: { sortBy: "time", sortOrder: "desc" },
  });

  const recent = auctions.slice(0, 5);

  const columns: Column<AuctionInfo>[] = [
    {
      key: "name",
      header: "Token",
      accessor: (a) => <ModuleAsset assetName={a.name} kind="spot" name={a.name} />,
    },
    {
      key: "deployer",
      header: "Deployer",
      type: "address",
      accessor: "deployer",
    },
    {
      key: "time",
      header: "Date",
      type: "time",
      accessor: (a) => formatDateTime(a.time, dateFormat),
    },
    {
      key: "gas",
      header: "Deploy Gas",
      type: "fees",
      accessor: (a) =>
        `${formatNumber(parseFloat(a.deployGas), format, {
          maximumFractionDigits: 2,
        })} ${a.currency}`,
    },
  ];

  return (
    <TypedDataTable<AuctionInfo>
      title="Recent auctions"
      viewAllHref="/market/perp/auction"
      viewAllLabel="View all"
      data={recent}
      columns={columns}
      getRowKey={(a) => `${a.tokenId}-${a.index}`}
      isLoading={isLoading && recent.length === 0}
      error={error}
      emptyMessage="No recent auctions"
      emptyDescription=""
      density="compact"
    />
  );
}
