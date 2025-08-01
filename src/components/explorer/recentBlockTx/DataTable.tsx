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
      <span className="text-white font-inter">
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
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );

  const AddressLink = ({ address }: { address: string }) => (
    <div className="flex items-center gap-1.5">
      <Link 
        href={`/explorer/address/${address}`}
        className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors"
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
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );

  if (type === 'blocks') {
    const blocks = data as Block[];
    return (
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-none bg-[#051728]">
            <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Block</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Time</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Hash</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Proposer</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 text-right text-xs">Txs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#051728]">
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <TableRow key={block.height} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                <TableCell className="py-3 px-4 text-sm">
                  <Link 
                    href={`/explorer/block/${block.height}`}
                    className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors"
                  >
                    {block.height}
                  </Link>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white">{formatDistanceToNowStrict(block.blockTime, { addSuffix: false })}</TableCell>
                <TableCell className="py-3 px-4 text-sm">
                  <HashDisplay hash={block.hash} />
                </TableCell>
                <TableCell className="py-3 px-4 text-sm">
                  <AddressLink address={block.proposer} />
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white text-right">{block.numTxs}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                  <p className="text-white text-sm mb-1">{emptyMessage}</p>
                  <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
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
        <TableRow className="border-none bg-[#051728]">
          <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Time</TableHead>
          <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Action</TableHead>
          <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">User</TableHead>
          <TableHead className="text-white font-normal py-3 px-4 text-left text-xs">Hash</TableHead>
          <TableHead className="text-white font-normal py-3 px-4 text-right text-xs">Block</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-[#051728]">
                  {transactions.length > 0 ? (
          transactions.map((tx) => (
            <TableRow key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
              <TableCell className="py-3 px-4 text-sm text-white">{formatDistanceToNowStrict(tx.time, { addSuffix: false })}</TableCell>
              <TableCell className="py-3 px-4 text-sm text-[#FFFFFF]">
                <div className="relative group">
                  <span>
                    {(tx.action?.type || 'Unknown').length > 7 
                      ? `${(tx.action?.type || 'Unknown').substring(0, 7)}...` 
                      : (tx.action?.type || 'Unknown')
                    }
                  </span>
                  {(tx.action?.type || 'Unknown').length > 7 && (
                    <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover:visible">
                      <div className="bg-[#051728] border border-[#83E9FF4D] rounded-lg px-3 py-2 text-sm text-white shadow-lg max-w-xs">
                        {tx.action?.type || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-sm">
                <AddressLink address={tx.user} />
              </TableCell>
              <TableCell className="py-3 px-4 text-sm">
                <HashDisplay hash={tx.hash} />
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-right">
                <Link 
                  href={`/explorer/block/${tx.block}`}
                  className="text-white font-inter hover:text-[#83E9FF] transition-colors"
                >
                  {tx.block}
                </Link>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                <p className="text-white text-sm mb-1">{emptyMessage}</p>
                <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 