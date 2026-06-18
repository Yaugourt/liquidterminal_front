"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useActiveUsers, type ActiveUser } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypedDataTable, type Column } from "@/components/common";
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
      header: "Rank",
      accessor: (_u, _i, absoluteIndex) => (
        <span className="text-gold font-semibold">#{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (u) => (
        <Link
          href={`/market/tracker/wallet/${u.user}`}
          className="text-sm text-brand hover:underline"
        >
          {u.user.slice(0, 6)}...{u.user.slice(-4)}
        </Link>
      ),
    },
    {
      key: "fill_count",
      header: "Fills",
      sortable: true,
      align: "right",
      getSortValue: (u) => u.fill_count,
      accessor: (u) => formatLargeNumber(u.fill_count),
    },
    {
      key: "total_volume",
      header: "Volume",
      sortable: true,
      align: "right",
      getSortValue: (u) => u.total_volume,
      accessor: (u) => `$${formatLargeNumber(u.total_volume)}`,
    },
    {
      key: "unique_coins",
      header: "Coins",
      sortable: true,
      align: "right",
      getSortValue: (u) => u.unique_coins,
      accessor: (u) => u.unique_coins,
    },
    {
      key: "last_activity",
      header: "Last Active",
      sortable: true,
      align: "right",
      getSortValue: (u) => new Date(u.last_activity).getTime(),
      accessor: (u) => (
        <span className="text-text-tertiary">{timeAgo(u.last_activity)}</span>
      ),
    },
  ];

  return (
    <TypedDataTable<ActiveUser>
      title="Active Users"
      icon={<Users className="h-5 w-5 text-brand" />}
      subtitle={`${metadata?.totalCount || users.length} users`}
      headerAction={
        <Select value={hours.toString()} onValueChange={(val) => setHours(Number(val))}>
          <SelectTrigger className="w-[120px]">
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
    />
  );
}
