import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Check, Database } from "lucide-react";
import { Block, Transaction } from "@/services/explorer/types";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
      <span className="text-white font-mono text-xs">
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
          <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all duration-200" />
        )}
      </button>
    </div>
  );

  const AddressLink = ({ address }: { address: string }) => (
    <div className="flex items-center gap-1.5">
      <Link 
        href={`/explorer/address/${address}`}
        prefetch={false}
        className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
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
          <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all duration-200" />
        )}
      </button>
    </div>
  );

  if (type === 'blocks') {
    const blocks = data as Block[];
    return (
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-white/5 hover:bg-transparent">
            <TableHead className="py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Block</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Hash</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Proposer</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Txs</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <TableRow key={block.height} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <TableCell className="py-3 px-3 text-sm">
                  <Link 
                    href={`/explorer/block/${block.height}`}
                    prefetch={false}
                    className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
                  >
                    {block.height}
                  </Link>
                </TableCell>
                <TableCell className="py-3 px-3 text-sm text-white font-medium">{formatDistanceToNowStrict(block.blockTime, { addSuffix: false })}</TableCell>
                <TableCell className="py-3 px-3 text-sm">
                  <HashDisplay hash={block.hash} />
                </TableCell>
                <TableCell className="py-3 px-3 text-sm">
                  <AddressLink address={block.proposer} />
                </TableCell>
                <TableCell className="py-3 px-3 text-sm text-white font-medium text-right">{block.numTxs}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-8 border-none">
                <div className="flex flex-col items-center justify-center text-center">
                  <Database className="w-10 h-10 mb-3 text-zinc-600" />
                  <p className="text-zinc-400 text-sm mb-1">{emptyMessage}</p>
                  <p className="text-zinc-600 text-xs">Come back later</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  // Transactions table
  const transactions = data as Transaction[];
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow className="border-b border-white/5 hover:bg-transparent">
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Time</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Action</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">User</span>
          </TableHead>
          <TableHead className="py-3 px-3">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Hash</span>
          </TableHead>
          <TableHead className="py-3 px-3 text-right">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Block</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <TableRow key={tx.hash} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <TableCell className="py-3 px-3 text-sm text-white font-medium">{formatDistanceToNowStrict(tx.time, { addSuffix: false })}</TableCell>
              <TableCell className="py-3 px-3 text-sm">
                <div className="relative group">
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#83e9ff]/10 text-[#83e9ff]">
                    {(tx.action?.type || 'Unknown').length > 7 
                      ? `${(tx.action?.type || 'Unknown').substring(0, 7)}...` 
                      : (tx.action?.type || 'Unknown')
                    }
                  </span>
                  {(tx.action?.type || 'Unknown').length > 7 && (
                    <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover:visible">
                      <div className="bg-[#151A25] border border-white/10 rounded-lg px-3 py-2 text-sm text-white shadow-lg max-w-xs">
                        {tx.action?.type || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3 px-3 text-sm">
                <AddressLink address={tx.user} />
              </TableCell>
              <TableCell className="py-3 px-3 text-sm">
                <HashDisplay hash={tx.hash} />
              </TableCell>
              <TableCell className="py-3 px-3 text-sm text-right">
                <Link 
                  href={`/explorer/block/${tx.block}`}
                  prefetch={false}
                  className="text-white font-mono text-xs hover:text-[#83E9FF] transition-colors"
                >
                  {tx.block}
                </Link>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="py-8 border-none">
              <div className="flex flex-col items-center justify-center text-center">
                <Database className="w-10 h-10 mb-3 text-zinc-600" />
                <p className="text-zinc-400 text-sm mb-1">{emptyMessage}</p>
                <p className="text-zinc-600 text-xs">Come back later</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 