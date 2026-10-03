"use client";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { TypedDataTable, type Column } from "@/components/common";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { BlockTransaction } from "@/services/explorer";
import { decodeAction, useAssetResolver, type Activity } from "@/services/explorer/address";
import type { UserTransaction } from "@/services/explorer/address/types";
import { ActionLabel, ActivityDetails, ActivityValue } from "@/components/explorer/address";
import { useMemo, useState } from "react";

export function BlockTransactionList({
  transactions,
  onTransactionClick,
  onAddressClick,
}: BlockTransactionListProps) {
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
        <div className="flex items-center gap-2">
          <span
            className="text-brand text-sm cursor-pointer hover:text-brand/80 transition-colors"
            onClick={() => onTransactionClick(tx.hash)}
          >
            <span className="sm:hidden">{tx.hash.slice(0, 6)}…{tx.hash.slice(-4)}</span>
            <span className="hidden sm:inline">{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
          </span>
          <CopyButton text={tx.hash} />
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => {
        const a = decoded.get(tx.hash);
        return a ? (
          <ActionLabel a={a} />
        ) : (
          <span className="inline-block px-2 py-1 rounded-md text-xs font-bold bg-surface-2 text-text-secondary">{tx.action.type}</span>
        );
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
      accessor: (tx) => (
        <div className="flex items-center gap-2">
          <span
            className="text-brand text-sm cursor-pointer hover:text-brand/80 transition-colors"
            onClick={() => onAddressClick(tx.user)}
          >
            <span className="sm:hidden">{tx.user.slice(0, 6)}…{tx.user.slice(-4)}</span>
            <span className="hidden sm:inline">{tx.user.slice(0, 12)}...{tx.user.slice(-8)}</span>
          </span>
          <CopyButton text={tx.user} />
        </div>
      ),
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

  return (
    <Card className="p-1.5 sm:p-4 flex flex-col">
      {systemCount > 0 && (
        <div className="flex items-center gap-2 pb-2.5 text-[12px] text-text-tertiary">
          <span>
            {transactions.length - systemCount} user transaction{transactions.length - systemCount === 1 ? "" : "s"}
            {" · "}
            {systemCount} system (validator no-ops, votes, oracle updates)
          </span>
          <button
            type="button"
            onClick={() => setShowSystem((v) => !v)}
            aria-pressed={showSystem}
            className="ml-auto px-2.5 py-1 rounded-md border border-border-subtle hover:text-text-secondary focus-ring"
          >
            {showSystem ? "Hide system" : "Show system"}
          </button>
        </div>
      )}
      <TypedDataTable<BlockTransaction>
        data={shown}
        columns={columns}
        getRowKey={(tx) => tx.hash}
        emptyMessage="No transaction in this block"
        emptyDescription=""
        paginate
        itemsPerPage={15}
        rowsPerPageOptions={[10, 15, 25, 50]}
        paginationVariant={shown.length > 15 ? "full" : "none"}
      />
    </Card>
  );
}
