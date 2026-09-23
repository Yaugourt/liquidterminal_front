"use client";

import { TypedDataTable, ModuleAsset, SideBadge, toTradeSide, type Column } from "@/components/common";
import { formatAssetValue } from "@/lib/formatters/numberFormatting";
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
      key: "coin",
      header: "Token",
      accessor: (o) => <ModuleAsset assetName={o.coin} name={o.coin} />,
    },
    {
      key: "orderType",
      header: "Method",
      type: "text",
      accessor: (o) => o.orderType,
    },
    {
      key: "side",
      header: "Side",
      // HL book side: "B" = bid (buy), "A" = ask (sell).
      accessor: (o) => {
        const side = toTradeSide(o.side);
        return side ? <SideBadge side={side} /> : "—";
      },
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      accessor: (o) => formatNumberValue(o.sz, format),
    },
    {
      key: "limitPx",
      header: "Price",
      type: "numeric",
      accessor: (o) => (o.limitPx ? formatNumberValue(o.limitPx, format) : "Market"),
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      accessor: (o) =>
        o.limitPx ? formatAssetValue(parseFloat(o.sz) * parseFloat(o.limitPx), format) : "—",
    },
    {
      key: "reduceOnly",
      header: "Reduce only",
      type: "text",
      tone: (o) => (o.reduceOnly ? undefined : "muted"),
      accessor: (o) => (o.reduceOnly ? "Yes" : "No"),
    },
    {
      key: "tif",
      header: "TIF",
      type: "text",
      accessor: (o) => o.tif ?? "—",
    },
  ];

  return (
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
      density="compact"
    />
  );
}
