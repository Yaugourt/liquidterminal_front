import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useExplorerStore } from "@/services/explorer";
import { Button } from "@/components/ui/button";
import { PiPause, PiPlay } from "react-icons/pi";
import { Loader2, Database } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

type TabType = 'blocks' | 'transactions';

export function RecentDataTable() {
  const store = useExplorerStore();
  const [activeTab, setActiveTab] = useState<TabType>('blocks');
  const [isBlocksPaused, setIsBlocksPaused] = useState(false);
  const [isTransactionsPaused, setIsTransactionsPaused] = useState(false);

  const handleBlocksClick = useCallback(() => setActiveTab("blocks"), []);
  const handleTransactionsClick = useCallback(() => setActiveTab("transactions"), []);

  // Gestion des connexions WebSocket avec délai pour éviter les erreurs au chargement
  useEffect(() => {
    // Délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(() => {
      if ((activeTab === 'blocks' && isBlocksPaused) || (activeTab === 'transactions' && isTransactionsPaused)) {
        store.disconnectBlocks();
        store.disconnectTransactions();
        return;
      }

      if (activeTab === 'blocks') {
        store.connectBlocks();
        store.disconnectTransactions();
      } else {
        store.connectTransactions();
        store.disconnectBlocks();
      }
    }, 1000); // Attendre 1 seconde après le montage

    return () => {
      clearTimeout(timer);
      store.disconnectBlocks();
      store.disconnectTransactions();
    };
  }, [activeTab, isBlocksPaused, isTransactionsPaused]);

  const BlocksContent = () => {
    const isConnected = store.isBlocksConnected;
    const data = store.blocks.slice(0, 5); // Limiter à 5 pour le petit format

    if (!isConnected && data.length === 0) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-[#FFFFFF80] text-sm">Connecting...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full">
          <thead>
            <tr className="border-none bg-[#051728]">
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Block</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Time</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Hash</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Proposer</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-right text-xs">Txs</th>
            </tr>
          </thead>
          <tbody className="bg-[#051728]">
            {data.length > 0 ? (
              data.map((block) => (
                <tr key={block.height} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{block.height}</td>
                  <td className="py-3 px-4 text-sm text-white">{formatDistanceToNowStrict(block.blockTime, { addSuffix: false })}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{block.hash.slice(0, 6)}...{block.hash.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{block.proposer.slice(0, 6)}...{block.proposer.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">{block.numTxs}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">{isBlocksPaused ? 'En pause' : 'En attente de blocs...'}</p>
                    <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const TransactionsContent = () => {
    const isConnected = store.isTransactionsConnected;
    const data = store.transactions.slice(0, 5); // Limiter à 5 pour le petit format

    if (!isConnected && data.length === 0) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-[#FFFFFF80] text-sm">Connecting...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <table className="w-full">
          <thead>
            <tr className="border-none bg-[#051728]">
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Time</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Action</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">User</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-left text-xs">Hash</th>
              <th className="text-[#FFFFFF99] font-normal py-3 px-4 text-right text-xs">Block</th>
            </tr>
          </thead>
          <tbody className="bg-[#051728]">
            {data.length > 0 ? (
              data.map((tx) => (
                <tr key={tx.hash} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{formatDistanceToNowStrict(tx.time, { addSuffix: false })}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{tx.action?.type || 'Unknown'}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{tx.user.slice(0, 6)}...{tx.user.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-[#83E9FF]">{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">{tx.block}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">{isTransactionsPaused ? 'En pause' : 'En attente de transactions...'}</p>
                    <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const isConnected = activeTab === 'blocks' ? store.isBlocksConnected : store.isTransactionsConnected;
  const isPaused = activeTab === 'blocks' ? isBlocksPaused : isTransactionsPaused;
  const handlePauseToggle = () => {
    if (activeTab === 'blocks') {
      setIsBlocksPaused(!isBlocksPaused);
    } else {
      setIsTransactionsPaused(!isTransactionsPaused);
    }
  };

  return (
    <div className="w-full">
      {/* Tab Buttons and Controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Button
            onClick={handleBlocksClick}
            variant="ghost"
            size="sm"
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
              ${activeTab === "blocks"
                ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
                : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
            `}
          >
            BLOCKS
          </Button>
          <Button
            onClick={handleTransactionsClick}
            variant="ghost"
            size="sm"
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
              ${activeTab === "transactions"
                ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
                : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
            `}
          >
            TRANSACTIONS
          </Button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-xs font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePauseToggle}
            className="text-white hover:bg-[#FFFFFF0A] p-2"
          >
            {isPaused ? <PiPlay className="h-4 w-4" /> : <PiPause className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl mx-auto">
        {activeTab === "blocks" && <BlocksContent />}
        {activeTab === "transactions" && <TransactionsContent />}
      </Card>
    </div>
  );
} 