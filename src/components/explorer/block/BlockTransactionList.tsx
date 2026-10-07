"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { BlockTransaction } from "@/services/explorer";
import { decodeAction, useAssetResolver, type Activity } from "@/services/explorer/address";
import type { UserTransaction } from "@/services/explorer/address/types";
import { ActionLabel, ActivityDetails, ActivityValue } from "@/components/explorer/address";

/**
 * Transactions of one block, decoded into what each one did. Hash and user
 * cells are `AddressDisplay` links (`/explorer/transaction/…`, `/explorer/address/…`).
 */
export function BlockTransactionList({ transactions }: BlockTransactionListProps) {
  const assets = useAssetResolver();
  // Decoded once per block: what each transaction did, in words.
  const decoded = useMemo(() => {
    const m = new Map<string, Activity>();
    if (!assets) return m;
    for (const tx of transactions) m.set(tx.hash, decodeAction(tx as unknown as UserTransaction, assets));
    return m;
  }, [transactions, assets]);

  const columns: Column<BlockTransaction>[] = [
    {
      key: "hash",
      header: "Hash",
      accessor: (tx) => (
        <AddressDisplay
          address={tx.hash}
          href={`/explorer/transaction/${tx.hash}`}
          copyMessage="Hash copied to clipboard"
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => {
        const a = decoded.get(tx.hash);
        return a ? <ActionLabel a={a} /> : <StatusBadge variant="neutral">{tx.action.type}</StatusBadge>;
      },
    },
    {
      key: "details",
      header: "Details",
      className: "hidden md:table-cell",
      accessor: (tx) => {
        const a = decoded.get(tx.hash);
        return a ? <ActivityDetails a={a} currentAddress={tx.user} /> : null;
      },
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      className: "hidden md:table-cell",
      accessor: (tx) => {
        const a = decoded.get(tx.hash);
        return a ? <ActivityValue a={a} /> : null;
      },
    },
    {
      key: "user",
      header: "User",
      accessor: (tx) => <AddressDisplay address={tx.user} />,
    },
  ];

  return (
    <TypedDataTable<BlockTransaction>
      title="Transactions"
      tag={transactions.length > 0 ? `${transactions.length} txs` : undefined}
      data={transactions}
      columns={columns}
      getRowKey={(tx) => tx.hash}
      emptyMessage="No transactions in this block"
      emptyDescription=""
      paginate
      itemsPerPage={15}
      rowsPerPageOptions={[10, 15, 25, 50]}
      paginationVariant={transactions.length > 15 ? "full" : "none"}
    />
  );
}
