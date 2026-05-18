"use client";

import { Gavel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TypedDataTable, type Column } from "@/components/common";
import { useAuctions } from "@/services/market/auction/hooks/useAuctions";
import type { AuctionInfo } from "@/services/market/auction/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";

/** Les 5 dernières auctions — mini-table V4, à placer à côté de l'AuctionCard. */
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
      accessor: (a) => (
        <span className="font-medium text-text-primary">{a.name}</span>
      ),
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
      accessor: (a) => (
        <span className="text-text-secondary">
          {formatDateTime(a.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "gas",
      header: "Deploy Gas",
      type: "numeric",
      accessor: (a) =>
        `${formatNumber(parseFloat(a.deployGas), format, {
          maximumFractionDigits: 2,
        })} ${a.currency}`,
    },
  ];

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
          <Gavel className="w-3.5 h-3.5 text-brand" />
        </div>
        <h3 className="text-xs font-medium text-text-primary tracking-tight">
          Recent Auctions
        </h3>
      </div>

      <div className="flex-1">
        <TypedDataTable<AuctionInfo>
          data={recent}
          columns={columns}
          getRowKey={(a) => `${a.tokenId}-${a.index}`}
          isLoading={isLoading && recent.length === 0}
          error={error}
          density="compact"
          emptyMessage="No recent auctions"
          emptyDescription=""
        />
      </div>
    </Card>
  );
}
