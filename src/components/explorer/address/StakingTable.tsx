import { compactHype, compactUsd } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { TableStat } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StakingTableContent } from "./staking";
import { useValidatorDelegations } from "@/services/explorer/validator/hooks/validator/useValidatorDelegations";
import { useStakingValidationsPaginated } from "@/services/explorer/validator/hooks/staking/useStakingValidationsPaginated";
import { useDelegatorHistory } from "@/services/explorer/validator/hooks/delegator/useDelegatorHistory";
import { useDelegatorRewards } from "@/services/explorer/validator/hooks/delegator/useDelegatorRewards";
import { useDelegatorSummary } from "@/services/explorer/validator/hooks/delegator/useDelegatorSummary";
import { useHypeLivePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useState, useCallback, useEffect, useMemo } from "react";

type StakingSubTab = 'delegations' | 'history' | 'rewards';

const SUB_TABS: { value: StakingSubTab; label: string }[] = [
  { value: 'delegations', label: 'Delegations' },
  { value: 'history', label: 'History' },
  { value: 'rewards', label: 'Rewards' },
];

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
    summary: delegatorSummary
  } = useDelegatorSummary(address);

  // Hook pour le prix HYPE en temps réel
  const hypePrice = useHypeLivePrice();

  // Hook pour l'historique des transactions de staking avec pagination (backup)
  const {
    validations: allStakingHistory,
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

  const toolbar = (
    <>
      <PillTabs
        variant="text"
        tabs={SUB_TABS}
        activeTab={activeSubTab}
        onTabChange={(v) => handleSubTabChange(v as StakingSubTab)}
      />
      <div className="ml-auto flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <TableStat
          label="Delegated"
          value={`${compactHype(stakingBalance)} HYPE`}
          sub={hypePrice ? compactUsd(stakingBalance * hypePrice) : undefined}
        />
        <TableStat
          label="Undelegated"
          value={`${compactHype(undelegatedAmount)} HYPE`}
          sub={hypePrice ? compactUsd(undelegatedAmount * hypePrice) : undefined}
        />
        <TableStat
          label="Pending"
          value={`${compactHype(pendingWithdrawal)} HYPE`}
          sub={hypePrice ? compactUsd(pendingWithdrawal * hypePrice) : undefined}
          tone={pendingWithdrawal > 0 ? "gold" : "primary"}
        />
      </div>
    </>
  );

  return (
    <StakingTableContent
      activeSubTab={activeSubTab}
      toolbar={toolbar}
      pagination={{
        total: totalItems,
        page: currentPage,
        rowsPerPage,
        onPageChange: handlePageChange,
        onRowsPerPageChange: handleRowsPerPageChange,
      }}
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
  );
}
