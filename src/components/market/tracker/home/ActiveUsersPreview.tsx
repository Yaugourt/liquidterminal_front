"use client";

import { useState } from "react";
import { useActiveUsers, type ActiveUser } from "@/services/market/activeusers";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { timeAgo } from "@/lib/formatters/dateFormatting";

export function ActiveUsersPreview() {
  const [hours, setHours] = useState(24);

  const { users, metadata, isLoading, error, refetch } = useActiveUsers({
    hours,
    limit: 100,
  });

  const columns: Column<ActiveUser>[] = [
    {
      key: "rank",
      header: "#",
      type: "rank",
      accessor: (_u, _i, absoluteIndex) => absoluteIndex + 1,
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (u) => (
        <AddressDisplay address={u.user} href={`/market/tracker/wallet/${u.user}`} showCopy={false} />
      ),
    },
    {
      key: "fill_count",
      header: "Fills",
      sortable: true,
      getSortValue: (u) => u.fill_count,
      type: "numeric",
      accessor: (u) => compactCount(u.fill_count),
    },
    {
      key: "total_volume",
      header: "Volume",
      sortable: true,
      getSortValue: (u) => u.total_volume,
      type: "numeric",
      accessor: (u) => compactUsd(u.total_volume),
    },
    {
      key: "unique_coins",
      header: "Coins",
      sortable: true,
      getSortValue: (u) => u.unique_coins,
      type: "numeric",
      className: "max-sm:hidden",
      accessor: (u) => compactCount(u.unique_coins),
    },
    {
      key: "last_activity",
      header: "Last Active",
      sortable: true,
      type: "time",
      align: "right",
      getSortValue: (u) => new Date(u.last_activity).getTime(),
      accessor: (u) => timeAgo(u.last_activity),
    },
  ];

  return (
    <TypedDataTable<ActiveUser>
      title="Active Users"
      tag={`${compactCount(metadata?.totalCount || users.length)} users`}
      headerAction={
        <Select value={hours.toString()} onValueChange={(val) => setHours(Number(val))}>
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 1h</SelectItem>
            <SelectItem value="4">Last 4h</SelectItem>
            <SelectItem value="12">Last 12h</SelectItem>
            <SelectItem value="24">Last 24h</SelectItem>
            <SelectItem value="168">Last 7d</SelectItem>
          </SelectContent>
        </Select>
      }
      data={users}
      columns={columns}
      getRowKey={(u) => u.user}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Failed to load active users"
      emptyMessage="No active users data available"
      paginate
      itemsPerPage={10}
      density="compact"
    />
  );
}
