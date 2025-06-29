import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useExplorerStore } from "@/services/explorer";
import { Button } from "@/components/ui/button";
import { PiPause, PiPlay } from "react-icons/pi";
import { Loader2 } from "lucide-react";
import { TabSelector } from "./TabSelector";
import { ConnectionStatus } from "./ConnectionStatus";
import { DataTable } from "./DataTable";

type TabType = 'blocks' | 'transactions';

export function RecentDataTable() {
  const store = useExplorerStore();
  const [activeTab, setActiveTab] = useState<TabType>('blocks');
  const [isBlocksPaused, setIsBlocksPaused] = useState(false);
  const [isTransactionsPaused, setIsTransactionsPaused] = useState(false);

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
      return store.blocks.slice(0, 5); // Limiter à 5 pour le petit format
    }
    return store.transactions.slice(0, 5);
  };

  const getEmptyMessage = () => {
    if (activeTab === 'blocks') {
      return isBlocksPaused ? 'En pause' : 'En attente de blocs...';
    }
    return isTransactionsPaused ? 'En pause' : 'En attente de transactions...';
  };

  const data = getCurrentData();
  const showLoading = !isConnected && data.length === 0;

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
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
            <DataTable 
              type={activeTab}
              data={data}
              emptyMessage={getEmptyMessage()}
            />
          </div>
        )}
      </Card>
    </div>
  );
} 