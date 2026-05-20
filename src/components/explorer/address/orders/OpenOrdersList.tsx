"use client";

import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { OpenOrder } from "@/services/explorer/address/types";
import { formatNumberValue } from "@/services/explorer/address";

interface OpenOrdersListProps {
  orders: OpenOrder[];
  isLoading: boolean;
  error?: Error | null;
}

export function OpenOrdersList({ orders, isLoading, error }: OpenOrdersListProps) {
  const { format } = useNumberFormat();

  const columns: Column<OpenOrder>[] = [
    {
      key: "orderType",
      header: "Method",
      accessor: (o) => <span className="text-text-primary">{o.orderType}</span>,
    },
    {
      key: "side",
      header: "Side",
      accessor: (o) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            o.side === "A"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {o.side === "A" ? "Buy" : "Sell"}
        </span>
      ),
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      accessor: (o) => (
        <span className="text-text-primary">{formatNumberValue(o.sz, format)}</span>
      ),
    },
    {
      key: "coin",
      header: "Token",
      accessor: (o) => <span className="text-text-primary">{o.coin}</span>,
    },
    {
      key: "limitPx",
      header: "Price",
      type: "numeric",
      accessor: (o) => (
        <span className="text-text-primary">
          {o.limitPx ? formatNumberValue(o.limitPx, format) : "Market"}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      accessor: (o) => (
        <span className="text-text-primary">
          {o.limitPx
            ? `$${formatNumber(parseFloat(o.sz) * parseFloat(o.limitPx), format)}`
            : "-"}
        </span>
      ),
    },
    {
      key: "reduceOnly",
      header: "Reduce Only",
      accessor: (o) => (
        <span className="text-text-primary">{o.reduceOnly ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "tif",
      header: "Time in Force",
      accessor: (o) => <span className="text-text-primary">{o.tif}</span>,
    },
  ];

  return (
    <div className="space-y-0">
      <TypedDataTable<OpenOrder>
        data={orders}
        columns={columns}
        getRowKey={(o, idx) => `${o.coin}-${o.side}-${idx}`}
        isLoading={isLoading}
        error={error}
        errorTitle="Error loading orders"
        emptyMessage="No open orders found"
        emptyDescription="Your active orders will appear here"
        paginate
        itemsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginationVariant={orders.length > 0 ? "full" : "none"}
      />
    </div>
  );
}
