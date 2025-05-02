import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useExplorerStore } from "@/services/explorer/websocket.service";
import { formatDistanceToNowStrict } from "date-fns";
import { Pagination } from "./Pagination";

const ITEMS_PER_PAGE = 10;

export function BlocksTable() {
  const { blocks, isConnected, error, connect, disconnect } = useExplorerStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedBlocks = blocks.slice(startIndex, endIndex);

  return (
    <Card className="bg-[#051728E5] h-[650px] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg">Blocks</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-[#FFFFFF99]">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      {error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="w-full">
            <table className="w-full text-sm text-white">
              <thead className="text-[#FFFFFF99]">
                <tr>
                  <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                    Block
                  </th>
                  <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                    Time
                  </th>
                  <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                    Hash
                  </th>
                  <th className="text-left py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                    Proposer
                  </th>
                  <th className="text-right py-3 px-2 font-normal border-b border-[#83E9FF4D]">
                    Transactions
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="flex-1">
            <table className="w-full text-sm text-white">
              <tbody>
                {displayedBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-[#FFFFFF99]">
                      Waiting for blocks...
                    </td>
                  </tr>
                ) : (
                  displayedBlocks.map((block) => (
                    <tr
                      key={block.height}
                      className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
                    >
                      <td className="py-3 px-2 text-[#83E9FF]">{block.height}</td>
                      <td className="py-3 px-2">
                        {formatDistanceToNowStrict(block.blockTime, { addSuffix: true })}
                      </td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        {block.hash.slice(0, 6)}...{block.hash.slice(-4)}
                      </td>
                      <td className="py-3 px-2 text-[#83E9FF]">
                        {block.proposer.slice(0, 6)}...{block.proposer.slice(-4)}
                      </td>
                      <td className="py-3 px-2 text-right">{block.numTxs}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={blocks.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </Card>
  );
}
