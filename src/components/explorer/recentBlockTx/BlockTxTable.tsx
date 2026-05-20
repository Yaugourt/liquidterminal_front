import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Check } from "lucide-react";
import { Block, Transaction } from "@/services/explorer/types";
import Link from "next/link";
import { TypedDataTable, type Column } from "@/components/common";

type TabType = "blocks" | "transactions";

interface BlockTxTableProps {
  type: TabType;
  data: Block[] | Transaction[];
  emptyMessage: string;
}

// ── Shared sub-components (copy button + hash/address displays) ──────────────

function HashDisplay({ hash, onCopy, copied }: { hash: string; onCopy: (h: string) => void; copied: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-primary">
        {hash.slice(0, 4)}..{hash.slice(-3)}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onCopy(hash);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );
}

function AddressLink({ address, onCopy, copied }: { address: string; onCopy: (a: string) => void; copied: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/address/${address}`}
        prefetch={false}
        className="text-brand hover:text-text-primary transition-colors"
      >
        {address.slice(0, 4)}..{address.slice(-3)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onCopy(address);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );
}

// ── BlockTxTable ─────────────────────────────────────────────────────────────

export function BlockTxTable({ type, data, emptyMessage }: BlockTxTableProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  if (type === "blocks") {
    const blocks = data as Block[];

    const columns: Column<Block>[] = [
      {
        key: "height",
        header: "Block",
        accessor: (b) => (
          <Link
            href={`/explorer/block/${b.height}`}
            prefetch={false}
            className="text-brand hover:text-text-primary transition-colors"
          >
            {b.height}
          </Link>
        ),
      },
      {
        key: "blockTime",
        header: "Time",
        accessor: (b) => (
          <span className="text-text-primary font-medium">
            {formatDistanceToNowStrict(b.blockTime, { addSuffix: false })}
          </span>
        ),
      },
      {
        key: "hash",
        header: "Hash",
        accessor: (b) => (
          <HashDisplay
            hash={b.hash}
            onCopy={copyToClipboard}
            copied={copiedAddress === b.hash}
          />
        ),
      },
      {
        key: "proposer",
        header: "Proposer",
        accessor: (b) => (
          <AddressLink
            address={b.proposer}
            onCopy={copyToClipboard}
            copied={copiedAddress === b.proposer}
          />
        ),
      },
      {
        key: "numTxs",
        header: "Txs",
        type: "numeric",
        accessor: (b) => (
          <span className="text-text-primary font-medium">{b.numTxs}</span>
        ),
      },
    ];

    return (
      <TypedDataTable<Block>
        data={blocks}
        columns={columns}
        getRowKey={(b) => b.height}
        emptyMessage={emptyMessage}
        emptyDescription="Come back later"
        paginationVariant="none"
      />
    );
  }

  // Transactions table
  const transactions = data as Transaction[];

  const columns: Column<Transaction>[] = [
    {
      key: "time",
      header: "Time",
      accessor: (tx) => (
        <span className="text-text-primary font-medium">
          {formatDistanceToNowStrict(tx.time, { addSuffix: false })}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => {
        const actionType = tx.action?.type || "Unknown";
        return (
          <div className="relative group">
            <span className="px-2 py-1 rounded-md font-bold bg-brand/10 text-brand">
              {actionType.length > 7 ? `${actionType.substring(0, 7)}...` : actionType}
            </span>
            {actionType.length > 7 && (
              <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover:visible">
                <div className="bg-surface border border-border-default rounded-lg px-3 py-2 text-text-primary shadow-lg max-w-xs">
                  {actionType}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "user",
      header: "User",
      accessor: (tx) => (
        <AddressLink
          address={tx.user}
          onCopy={copyToClipboard}
          copied={copiedAddress === tx.user}
        />
      ),
    },
    {
      key: "hash",
      header: "Hash",
      accessor: (tx) => (
        <HashDisplay
          hash={tx.hash}
          onCopy={copyToClipboard}
          copied={copiedAddress === tx.hash}
        />
      ),
    },
    {
      key: "block",
      header: "Block",
      type: "numeric",
      accessor: (tx) => (
        <Link
          href={`/explorer/block/${tx.block}`}
          prefetch={false}
          className="text-text-primary hover:text-brand transition-colors"
        >
          {tx.block}
        </Link>
      ),
    },
  ];

  return (
    <TypedDataTable<Transaction>
      data={transactions}
      columns={columns}
      getRowKey={(tx) => tx.hash}
      emptyMessage={emptyMessage}
      emptyDescription="Come back later"
      paginationVariant="none"
    />
  );
}
