import { formatDistanceToNowStrict } from "date-fns";
import { Block, Transaction } from "@/services/explorer/types";

type TabType = 'blocks' | 'transactions';

interface DataTableProps {
  type: TabType;
  data: Block[] | Transaction[];
  emptyMessage: string;
}

export function DataTable({ type, data, emptyMessage }: DataTableProps) {
  const getActionDescription = (action: any) => {
    return action.type;
  };

  if (type === 'blocks') {
    const blocks = data as Block[];
    return (
      <table className="w-full text-sm text-white">
        <thead className="text-[#FFFFFF99]">
          <tr>
            <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Block</th>
            <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Time</th>
            <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Hash</th>
            <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Proposer</th>
            <th className="text-right py-3 px-2 font-normal border-b border-[#83E9FF4D]">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {blocks.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">{emptyMessage}</td>
            </tr>
          ) : (
            blocks.map((block) => (
              <tr key={block.height} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                <td className="py-3 px-2 text-[#83E9FF]">{block.height}</td>
                <td className="py-3 px-2">{formatDistanceToNowStrict(block.blockTime, { addSuffix: true })}</td>
                <td className="py-3 px-2 text-[#83E9FF]">{block.hash.slice(0, 6)}...{block.hash.slice(-4)}</td>
                <td className="py-3 px-2 text-[#83E9FF]">{block.proposer.slice(0, 6)}...{block.proposer.slice(-4)}</td>
                <td className="py-3 px-2 text-right">{block.numTxs}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  }

  // Transactions table
  const transactions = data as Transaction[];
  return (
    <table className="w-full text-sm text-white">
      <thead className="text-[#FFFFFF99]">
        <tr>
          <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Time</th>
          <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Action</th>
          <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">User</th>
          <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">Hash</th>
          <th className="text-right py-3 px-2 font-normal border-b border-[#83E9FF4D]">Block</th>
        </tr>
      </thead>
      <tbody>
        {transactions.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">{emptyMessage}</td>
          </tr>
        ) : (
          transactions.map((tx) => (
            <tr key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <td className="py-3 px-2">{formatDistanceToNowStrict(tx.time, { addSuffix: true })}</td>
              <td className="py-3 px-2 text-[#83E9FF]">{getActionDescription(tx.action)}</td>
              <td className="py-3 px-2 text-[#83E9FF]">{tx.user.slice(0, 6)}...{tx.user.slice(-4)}</td>
              <td className="py-3 px-2 text-[#83E9FF]">{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</td>
              <td className="py-3 px-2 text-right">{tx.block}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
} 