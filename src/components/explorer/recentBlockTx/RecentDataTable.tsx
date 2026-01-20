import { useEffect, useState, useRef } from "react";
import { useExplorerStore } from "@/services/explorer";
import { Button } from "@/components/ui/button";
import { Pause, Play, Loader2 } from "lucide-react";
import { TabSelector } from "./TabSelector";
// import { ConnectionStatus } from "./ConnectionStatus"; // Removed import
import { DataTable } from "./DataTable";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";

type TabType = 'blocks' | 'transactions';

// Inlined ConnectionStatus component
function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-xs font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
      </span>
    </div>
  );
}

export function RecentDataTable() {
  const store = useExplorerStore();
  const [activeTab, setActiveTab] = useState<TabType>('blocks');
  const [isBlocksPaused, setIsBlocksPaused] = useState(false);
  const [isTransactionsPaused, setIsTransactionsPaused] = useState(false);

  // États de pagination
  const blocksPagination = usePagination({ initialRowsPerPage: 5 });
  const transactionsPagination = usePagination({ initialRowsPerPage: 5 });

  // Mémoriser les méthodes du store pour éviter les boucles infinies
  const storeRef = useRef(store);
  storeRef.current = store;

  // Gestion des connexions WebSocket avec délai pour éviter les erreurs au chargement
  useEffect(() => {
    // Délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(() => {
      if ((activeTab === 'blocks' && isBlocksPaused) || (activeTab === 'transactions' && isTransactionsPaused)) {
        storeRef.current.disconnectBlocks();
        storeRef.current.disconnectTransactions();
        return;
      }

      if (activeTab === 'blocks') {
        storeRef.current.connectBlocks();
        storeRef.current.disconnectTransactions();
      } else {
        storeRef.current.connectTransactions();
        storeRef.current.disconnectBlocks();
      }
    }, 1000); // Attendre 1 seconde après le montage

    return () => {
      clearTimeout(timer);
      storeRef.current.disconnectBlocks();
      storeRef.current.disconnectTransactions();
    };
  }, [activeTab, isBlocksPaused, isTransactionsPaused]);

  const isConnected = activeTab === 'blocks' ? store.isBlocksConnected : store.isTransactionsConnected;
  const isPaused = activeTab === 'blocks' ? isBlocksPaused : isTransactionsPaused;

  const handlePauseToggle = () => {
    if (activeTab === 'blocks') {
      setIsBlocksPaused(!isBlocksPaused);
    } else {
      setIsTransactionsPaused(!isTransactionsPaused);
    }
  };

  const getCurrentData = () => {
    if (activeTab === 'blocks') {
      return {
        data: store.blocks.slice(blocksPagination.startIndex, blocksPagination.endIndex),
        total: store.blocks.length,
        page: blocksPagination.page,
        rowsPerPage: blocksPagination.rowsPerPage,
        onPageChange: blocksPagination.onPageChange,
        onRowsPerPageChange: blocksPagination.onRowsPerPageChange
      };
    } else {
      return {
        data: store.transactions.slice(transactionsPagination.startIndex, transactionsPagination.endIndex),
        total: store.transactions.length,
        page: transactionsPagination.page,
        rowsPerPage: transactionsPagination.rowsPerPage,
        onPageChange: transactionsPagination.onPageChange,
        onRowsPerPageChange: transactionsPagination.onRowsPerPageChange
      };
    }
  };

  const getEmptyMessage = () => {
    if (activeTab === 'blocks') {
      return isBlocksPaused ? 'En pause' : 'En attente de blocs...';
    }
    return isTransactionsPaused ? 'En pause' : 'En attente de transactions...';
  };

  const currentData = getCurrentData();
  const showLoading = !isConnected && currentData.data.length === 0;



  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Tabs and Controls */}
      <div className="flex justify-between items-center p-4 border-b border-border-subtle">
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Controls */}
        <div className="flex items-center gap-3">
          <ConnectionStatus isConnected={isConnected} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePauseToggle}
            className="interactive-secondary p-2"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {showLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
              <span className="text-text-muted text-sm">Connecting...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <DataTable
                type={activeTab}
                data={currentData.data}
                emptyMessage={getEmptyMessage()}
              />
            </div>

            {currentData.total > 0 && (
              <div className="px-4 py-3 border-t border-border-subtle">
                <Pagination
                  total={currentData.total}
                  page={currentData.page}
                  rowsPerPage={currentData.rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 500]}
                  onPageChange={currentData.onPageChange}
                  onRowsPerPageChange={currentData.onRowsPerPageChange}
                  disabled={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 