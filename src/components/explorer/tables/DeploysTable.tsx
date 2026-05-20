"use client";

import { useDeploys } from "@/services/explorer";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import type { FormattedDeploy } from "@/services/explorer/types";

export function DeploysTable() {
  const { format: dateFormat } = useDateFormat();
  const { deploys, isLoading, error } = useDeploys();

  const allDeploys: FormattedDeploy[] = deploys || [];

  const columns: Column<FormattedDeploy>[] = [
    {
      key: "time",
      header: "Time",
      accessor: (d) => (
        <span className="text-text-primary font-medium">
          {formatDateTime(d.timestamp, dateFormat)}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (d) => <AddressDisplay address={d.user} />,
    },
    {
      key: "action",
      header: "Action",
      accessor: (d) => (
        <StatusBadge variant={d.status === "error" ? "error" : "success"}>
          {d.action}
        </StatusBadge>
      ),
    },
    {
      key: "hash",
      header: "Hash",
      accessor: (d) => (
        <AddressDisplay
          address={d.hash}
          showCopy={false}
          showExternalLink
          className="text-brand"
        />
      ),
    },
  ];

  return (
    <TypedDataTable<FormattedDeploy>
      data={allDeploys}
      columns={columns}
      getRowKey={(d) => d.hash}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load deploys"
      emptyMessage="No deploys available"
      emptyDescription="Come back later"
      paginate
      itemsPerPage={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      paginationVariant="full"
      paginationDisabled={isLoading}
    />
  );
}
