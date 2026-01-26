import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Check } from "lucide-react";
import { Block, Transaction } from "@/services/explorer/types";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DataTable as GenericDataTable } from "@/components/common/DataTable";

type TabType = 'blocks' | 'transactions';

interface DataTableProps {
  type: TabType;
  data: Block[] | Transaction[];
  emptyMessage: string;
}

export function DataTable({ type, data, emptyMessage }: DataTableProps) {
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

  const HashDisplay = ({ hash }: { hash: string }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-white font-mono">
        {hash.slice(0, 4)}..{hash.slice(-3)}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(hash);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copiedAddress === hash ? (
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );

  const AddressLink = ({ address }: { address: string }) => (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/address/${address}`}
        prefetch={false}
        className="text-brand-accent font-mono hover:text-white transition-colors"
      >
        {address.slice(0, 4)}..{address.slice(-3)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(address);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copiedAddress === address ? (
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );

  if (type === 'blocks') {
    const blocks = data as Block[];
    return (
      <GenericDataTable
        isEmpty={blocks.length === 0}
        emptyState={{
          title: emptyMessage,
          description: "Come back later"
        }}
        className="w-full"
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider">Block</span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider">Time</span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider">Hash</span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider">Proposer</span>
              </TableHead>
              <TableHead className="text-right">
                <span className="text-text-secondary font-semibold uppercase tracking-wider">Txs</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.height} className="hover:bg-white/[0.02]">
                <TableCell>
                  <Link
                    href={`/explorer/block/${block.height}`}
                    prefetch={false}
                    className="text-brand-accent font-mono hover:text-white transition-colors"
                  >
                    {block.height}
                  </Link>
                </TableCell>
                <TableCell className="text-white font-medium">{formatDistanceToNowStrict(block.blockTime, { addSuffix: false })}</TableCell>
                <TableCell>
                  <HashDisplay hash={block.hash} />
                </TableCell>
                <TableCell>
                  <AddressLink address={block.proposer} />
                </TableCell>
                <TableCell className="text-white font-medium text-right">{block.numTxs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GenericDataTable>
    );
  }

  // Transactions table
  const transactions = data as Transaction[];
  return (
    <GenericDataTable
      isEmpty={transactions.length === 0}
      emptyState={{
        title: emptyMessage,
        description: "Come back later"
      }}
      className="w-full"
    >
      <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <span className="text-text-secondary font-semibold uppercase tracking-wider">Time</span>
            </TableHead>
            <TableHead>
              <span className="text-text-secondary font-semibold uppercase tracking-wider">Action</span>
            </TableHead>
            <TableHead>
              <span className="text-text-secondary font-semibold uppercase tracking-wider">User</span>
            </TableHead>
            <TableHead>
              <span className="text-text-secondary font-semibold uppercase tracking-wider">Hash</span>
            </TableHead>
            <TableHead className="text-right">
              <span className="text-text-secondary font-semibold uppercase tracking-wider">Block</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.hash} className="hover:bg-white/[0.02]">
              <TableCell className="text-white font-medium">{formatDistanceToNowStrict(tx.time, { addSuffix: false })}</TableCell>
              <TableCell>
                <div className="relative group">
                  <span className="px-2 py-1 rounded-md font-bold bg-brand-accent/10 text-brand-accent">
                    {(tx.action?.type || 'Unknown').length > 7
                      ? `${(tx.action?.type || 'Unknown').substring(0, 7)}...`
                      : (tx.action?.type || 'Unknown')
                    }
                  </span>
                  {(tx.action?.type || 'Unknown').length > 7 && (
                    <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover:visible">
                      <div className="bg-brand-secondary border border-border-hover rounded-lg px-3 py-2 text-white shadow-lg max-w-xs">
                        {tx.action?.type || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <AddressLink address={tx.user} />
              </TableCell>
              <TableCell>
                <HashDisplay hash={tx.hash} />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/explorer/block/${tx.block}`}
                  prefetch={false}
                  className="text-white font-mono hover:text-brand-accent transition-colors"
                >
                  {tx.block}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GenericDataTable>
  );
} 