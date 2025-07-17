import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useExplorerStore } from "@/services/explorer";
import { Button } from "@/components/ui/button";
import { PiPause, PiPlay } from "react-icons/pi";
import { Loader2 } from "lucide-react";
import { TabSelector } from "./TabSelector";
import { ConnectionStatus } from "./ConnectionStatus";
import { DataTable } from "./DataTable";
import { Pagination } from "@/components/common/pagination";

type TabType = 'blocks' | 'transactions';

export function RecentDataTable() {
  const store = useExplorerStore();
  const [activeTab, setActiveTab] = useState<TabType>('blocks');
  const [isBlocksPaused, setIsBlocksPaused] = useState(false);
  const [isTransactionsPaused, setIsTransactionsPaused] = useState(false);
  
  // États de pagination
  const [blocksPage, setBlocksPage] = useState(0);
  const [blocksRowsPerPage, setBlocksRowsPerPage] = useState(5);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsRowsPerPage, setTransactionsRowsPerPage] = useState(5);

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
      const page = blocksPage;
      const rowsPerPage = blocksRowsPerPage;
      const startIndex = page * rowsPerPage;
      return {
        data: store.blocks.slice(startIndex, startIndex + rowsPerPage),
        total: store.blocks.length,
        page,
        rowsPerPage
      };
    } else {
      const page = transactionsPage;
      const rowsPerPage = transactionsRowsPerPage;
      const startIndex = page * rowsPerPage;
      return {
        data: store.transactions.slice(startIndex, startIndex + rowsPerPage),
        total: store.transactions.length,
        page,
        rowsPerPage
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

  const handlePageChange = (newPage: number) => {
    if (activeTab === 'blocks') {
      setBlocksPage(newPage);
    } else {
      setTransactionsPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if (activeTab === 'blocks') {
      setBlocksRowsPerPage(newRowsPerPage);
      setBlocksPage(0);
    } else {
      setTransactionsRowsPerPage(newRowsPerPage);
      setTransactionsPage(0);
    }
  };

  return (
    <div className="w-full">
      {/* Header avec TabSelector et Controls */}
      <div className="flex justify-between items-center mb-4">
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <ConnectionStatus isConnected={isConnected} />
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
        {showLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
              <span className="text-[#FFFFFF80] text-sm">Connecting...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
              <DataTable 
                type={activeTab}
                data={currentData.data}
                emptyMessage={getEmptyMessage()}
              />
            </div>
            
            {currentData.total > 0 && (
              <div className="px-4 py-2 bg-[#051728] border-t border-[#FFFFFF1A]">
                <Pagination
                  total={currentData.total}
                  page={currentData.page}
                  rowsPerPage={currentData.rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 500]}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  disabled={false}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
} 