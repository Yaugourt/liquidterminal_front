import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Pagination } from "@/components/common/pagination";
import { StakingTabButtons, StakingTableContent } from "./staking";
import { useValidatorDelegations } from "@/services/validator/hooks/validator/useValidatorDelegations";
import { useStakingValidationsPaginated } from "@/services/validator/hooks/staking/useStakingValidationsPaginated";
import { useDelegatorHistory } from "@/services/validator/hooks/delegator/useDelegatorHistory";
import { useDelegatorRewards } from "@/services/validator/hooks/delegator/useDelegatorRewards";
import { useDelegatorSummary } from "@/services/validator/hooks/delegator/useDelegatorSummary";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useState, useCallback, useEffect, useMemo } from "react";

type StakingSubTab = 'delegations' | 'history' | 'rewards';

interface StakingTableProps {
  address: string;
}

export function StakingTable({ address }: StakingTableProps) {
  const [activeSubTab, setActiveSubTab] = useState<StakingSubTab>('delegations');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { format } = useNumberFormat();

  // Hook pour les délégations (avec logique métier intégrée)
  const { 
    delegations, 
    totalStaked, 
    isLoading: delegationsLoading, 
    error: delegationsError 
  } = useValidatorDelegations(address);

  // Hook pour l'historique des délégations de l'utilisateur
  const { 
    history: delegatorHistory, 
    isLoading: delegatorHistoryLoading, 
    error: delegatorHistoryError 
  } = useDelegatorHistory(address);

  // Hook pour les récompenses des délégations de l'utilisateur
  const { 
    rewards: delegatorRewards, 
    isLoading: delegatorRewardsLoading, 
    error: delegatorRewardsError 
  } = useDelegatorRewards(address);

  // Hook pour le résumé des délégations de l'utilisateur
  const { 
    summary: delegatorSummary, 
    isLoading: delegatorSummaryLoading, 
    error: delegatorSummaryError 
  } = useDelegatorSummary(address);

  // Hook pour le prix HYPE en temps réel
  const { price: hypePrice } = useHypePrice();

  // Hook pour l'historique des transactions de staking avec pagination (backup)
  const { 
    validations: allStakingHistory, 
    total: historyTotal,
    isLoading: historyLoading, 
    error: historyError,
    updateParams: updateHistoryParams
  } = useStakingValidationsPaginated({
    limit: rowsPerPage
  });

  // Filtrer l'historique pour cet utilisateur (backup)
  const stakingHistory = useMemo(() => {
    return allStakingHistory.filter(tx => tx.user.toLowerCase() === address.toLowerCase());
  }, [allStakingHistory, address]);

  // Utiliser uniquement les données réelles des APIs
  const finalDelegations = delegations;
  const finalHistory = delegatorHistory.length > 0 ? delegatorHistory : stakingHistory;
  const finalRewards = delegatorRewards;
  const finalTotalStaked = totalStaked;

  const handleSubTabChange = useCallback((subTab: StakingSubTab) => {
    setActiveSubTab(subTab);
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    
    if (activeSubTab === 'history') {
      updateHistoryParams({ 
        page: newPage + 1 // Convert to 1-based for API
      });
    }
  }, [activeSubTab, updateHistoryParams]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
    if (activeSubTab === 'history') {
      updateHistoryParams({ 
        page: 1,
        limit: newRowsPerPage
      });
    }
  }, [activeSubTab, updateHistoryParams]);

  // Sync hooks pagination when switching to history tab
  useEffect(() => {
    if (activeSubTab === 'history') {
      updateHistoryParams({ 
        page: currentPage + 1,
        limit: rowsPerPage
      });
    }
  }, [activeSubTab, currentPage, rowsPerPage, updateHistoryParams]);

  // Calculate pagination for delegations (client-side)
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const getTotalItems = () => {
    switch (activeSubTab) {
      case 'delegations':
        return finalDelegations.length;
      case 'history':
        return finalHistory.length;
      case 'rewards':
        return finalRewards.length;
      default:
        return 0;
    }
  };

  const totalItems = getTotalItems();
  
  // Utiliser les données du résumé si disponibles, sinon fallback sur les anciennes données
  const stakingBalance = delegatorSummary ? parseFloat(delegatorSummary.delegated) : finalTotalStaked;
  const pendingWithdrawal = delegatorSummary ? parseFloat(delegatorSummary.totalPendingWithdrawal) : 0;
  const undelegatedAmount = delegatorSummary ? parseFloat(delegatorSummary.undelegated) : 0;

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        {/* Sub-tabs */}
        <StakingTabButtons 
          activeSubTab={activeSubTab}
          onSubTabChange={handleSubTabChange}
        />

        {/* Stats */}
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xs font-medium font-inter">Delegated:</span>
            <span className="text-[#4ADE80] text-sm font-semibold font-inter">
              {formatNumber(stakingBalance, format, { maximumFractionDigits: 2 })} HYPE
              {hypePrice && (
                <span className="text-white text-xs font-normal ml-1">
                  (${formatNumber(stakingBalance * hypePrice, format, { maximumFractionDigits: 2 })})
                </span>
              )}
            </span>
          </div>
          <div className="w-px h-4 bg-[#FFFFFF20]"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xs font-medium font-inter">Undelegated:</span>
            <span className="text-[#83E9FF] text-sm font-semibold font-inter">
              {formatNumber(undelegatedAmount, format, { maximumFractionDigits: 2 })} HYPE
              {hypePrice && (
                <span className="text-white text-xs font-normal ml-1">
                  (${formatNumber(undelegatedAmount * hypePrice, format, { maximumFractionDigits: 2 })})
                </span>
              )}
            </span>
          </div>
          <div className="w-px h-4 bg-[#FFFFFF20]"></div>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xs font-medium font-inter">Pending withdrawal:</span>
            <span className="text-[#F9E370] text-sm font-semibold font-inter">
              {formatNumber(pendingWithdrawal, format, { maximumFractionDigits: 2 })} HYPE
              {hypePrice && (
                <span className="text-white text-xs font-normal ml-1">
                  (${formatNumber(pendingWithdrawal * hypePrice, format, { maximumFractionDigits: 2 })})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1">
        <StakingTableContent 
          activeSubTab={activeSubTab}
          delegationsData={{
            delegations: finalDelegations.slice(startIndex, endIndex),
            loading: delegationsLoading,
            error: delegationsError
          }}
          historyData={{
            history: finalHistory.slice(startIndex, endIndex),
            loading: delegatorHistoryLoading || historyLoading,
            error: delegatorHistoryError || historyError
          }}
          rewardsData={{
            rewards: finalRewards.slice(startIndex, endIndex),
            loading: delegatorRewardsLoading,
            error: delegatorRewardsError
          }}
          format={format}
          hypePrice={hypePrice}
        />
      </div>

      {/* Pagination */}
      {totalItems > 10 && (
        <div className="border-t border-[#FFFFFF1A] flex items-center mt-auto">
          <div className="w-full px-4 py-3">
            <Pagination
              total={totalItems}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      )}
    </Card>
  );
} 