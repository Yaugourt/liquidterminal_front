"use client";

import { useMemo, useState } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { BlockTransaction } from "@/services/explorer";
import { decodeAction, useAssetResolver, type Activity } from "@/services/explorer/address";
import type { UserTransaction } from "@/services/explorer/address/types";
import { ActionLabel, ActivityDetails, ActivityValue } from "@/components/explorer/address";
import { cn } from "@/lib/utils";

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

  // Validator heartbeats, votes and oracle updates are most of a block: hidden
  // by default so user actions are readable, one tap to show them.
  const [showSystem, setShowSystem] = useState(false);
  const systemCount = useMemo(() => [...decoded.values()].filter((a) => a.kind === "system").length, [decoded]);
  const shown = useMemo(
    () => (showSystem ? transactions : transactions.filter((tx) => decoded.get(tx.hash)?.kind !== "system")),
    [transactions, decoded, showSystem]
  );
  const userCount = transactions.length - systemCount;

  const toolbar =
    systemCount > 0 ? (
      <>
        <span className="text-[12px] text-text-tertiary">
          {userCount} user transaction{userCount === 1 ? "" : "s"}
          {" · "}
          {systemCount} system (validator no-ops, votes, oracle updates)
        </span>
        <button
          type="button"
          onClick={() => setShowSystem((v) => !v)}
          aria-pressed={showSystem}
          className={cn(
            "ml-auto px-2.5 py-1 rounded-md text-[12px] border transition-colors focus-ring",
            showSystem ? "text-brand border-brand/30 bg-brand/10" : "text-text-tertiary border-border-subtle hover:text-text-secondary"
          )}
        >
          {showSystem ? "Hide system" : "Show system"}
        </button>
      </>
    ) : undefined;

  return (
    <TypedDataTable<BlockTransaction>
      title="Transactions"
      tag={transactions.length > 0 ? `${transactions.length} txs` : undefined}
      data={shown}
      columns={columns}
      getRowKey={(tx) => tx.hash}
      emptyMessage={systemCount > 0 && !showSystem ? "No user transactions in this block" : "No transactions in this block"}
      emptyDescription=""
      paginate
      itemsPerPage={15}
      rowsPerPageOptions={[10, 15, 25, 50]}
      paginationVariant={shown.length > 15 ? "full" : "none"}
      toolbar={toolbar}
    />
  );
}
