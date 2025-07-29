import { Card } from "@/components/ui/card";
import { useValidators } from "@/services/validator";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useStakingValidationsPaginated, useUnstakingQueuePaginated } from "@/services/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useState, useCallback, useEffect } from "react";
import { Pagination } from "../../common/pagination";
import { TabButtons, TableContent } from ".";
import { formatNumber } from "@/lib/numberFormatting";

type TabType = 'validators' | 'vaults';
type ValidatorSubTab = 'all' | 'transactions' | 'unstaking';

export function ValidatorsTable() {
  const [activeTab, setActiveTab] = useState<TabType>('validators');
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');
  const { validators, stats, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const [currentPage, setCurrentPage] = useState(0); // 0-based pour le composant common
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  
  // Use paginated staking validations when on transactions tab
  const { 
    validations: stakingValidations, 
    total: stakingTotal,
    isLoading: stakingLoading, 
    error: stakingError,
    updateParams: updateStakingParams
  } = useStakingValidationsPaginated({
    limit: rowsPerPage
  });

  // Use paginated unstaking queue when on unstaking tab
  const { 
    unstakingQueue, 
    total: unstakingTotal,
    isLoading: unstakingLoading, 
    error: unstakingError,
    updateParams: updateUnstakingParams
  } = useUnstakingQueuePaginated({
    limit: rowsPerPage
  });
  
  // For vaults, use API pagination instead of client-side pagination
  const { vaults, totalTvl, totalCount: vaultsTotalCount, isLoading: vaultsLoading, error: vaultsError, updateParams: updateVaultsParams } = useVaults({ 
    page: currentPage + 1, // Convert 0-based to 1-based for API
    limit: rowsPerPage,
    sortBy: 'tvl'
  });
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0);
    // Reset validator sub-tab when switching away from validators
    if (tab !== 'validators') {
      setValidatorSubTab('all');
    }
  }, []);

  const handleValidatorSubTabChange = useCallback((subTab: ValidatorSubTab) => {
    setValidatorSubTab(subTab);
    setCurrentPage(0);
  }, []);

  // Sync hooks pagination when switching to transactions tab
  useEffect(() => {
    if (activeTab === 'validators' && validatorSubTab === 'transactions') {
  
      updateStakingParams({ 
        page: currentPage + 1,
        limit: rowsPerPage 
      });
    }
  }, [activeTab, validatorSubTab, currentPage, rowsPerPage, updateStakingParams]);

  // Sync hooks pagination when switching to unstaking tab
  useEffect(() => {
    if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
  
      updateUnstakingParams({ 
        page: currentPage + 1,
        limit: rowsPerPage 
      });
    }
  }, [activeTab, validatorSubTab, currentPage, rowsPerPage, updateUnstakingParams]);

  // Handle page changes from Pagination component (receives 0-based page)
  const handlePageChange = useCallback((newPage: number) => {

    setCurrentPage(newPage);
    
    if (activeTab === 'validators' && validatorSubTab === 'transactions') {
      
      updateStakingParams({ page: newPage + 1 }); // Convert to 1-based for API
    } else if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
      
      updateUnstakingParams({ page: newPage + 1 }); // Convert to 1-based for API
    } else if (activeTab === 'vaults') {
      updateVaultsParams({ page: newPage + 1 }); // Convert to 1-based for API
    }
  }, [activeTab, validatorSubTab, updateStakingParams, updateUnstakingParams, updateVaultsParams]);

  // Handle rows per page changes from Pagination component
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {

    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page
    
    if (activeTab === 'validators' && validatorSubTab === 'transactions') {
      
      updateStakingParams({ 
        page: 1, // Reset to first page (1-based for API)
        limit: newRowsPerPage 
      });
    } else if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
      
      updateUnstakingParams({ 
        page: 1, // Reset to first page (1-based for API)
        limit: newRowsPerPage 
      });
    } else if (activeTab === 'vaults') {
      updateVaultsParams({ 
        page: 1, // Reset to first page (1-based for API)
        limit: newRowsPerPage 
      });
    }
  }, [activeTab, validatorSubTab, updateStakingParams, updateUnstakingParams, updateVaultsParams]);

  // Calculate pagination for validators (client-side) - only for 'all' tab
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  // Calculate total items based on active tab and validator sub-tab
  const getTotalItems = () => {
    if (activeTab === 'validators') {
      if (validatorSubTab === 'transactions') {
        return stakingTotal; // Use server-side total for transactions
      } else if (validatorSubTab === 'unstaking') {
        return unstakingTotal; // Use server-side total for unstaking queue
      }
      return validators.length;
    }
    return vaultsTotalCount;
  };
  
  const totalItems = getTotalItems();

  return (
    <div className="w-full">
      {/* Header avec TabButtons */}
      <div className="flex justify-start items-center mb-4">
        <TabButtons 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          {activeTab === 'validators' && (
            <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5 w-fit">
              {['all', 'transactions', 'unstaking'].map(tab => (
                <button
                  key={tab}
                  onClick={() => handleValidatorSubTabChange(tab as ValidatorSubTab)}
                  className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                    validatorSubTab === tab
                      ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                      : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'transactions' ? 'Transactions' : 'Unstaking Queue'}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'validators' ? (
            <div className="flex items-center gap-8">
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">Total:</span>
                <span className="text-white text-sm font-semibold">{stats.total}</span>
              </div>
              <div className="w-px h-4 bg-[#FFFFFF20]"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">Active:</span>
                <span className="text-[#83E9FF] text-sm font-semibold">{stats.active}</span>
              </div>
              <div className="w-px h-4 bg-[#FFFFFF20]"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">HYPE Staked:</span>
                <span className="text-[#F9E370] text-sm font-semibold">
                  {formatNumber(stats.totalHypeStaked, format, { maximumFractionDigits: 0 })}
                  {hypePrice && (
                    <span className="text-white text-xs ml-1">
                      (${formatNumber(stats.totalHypeStaked * hypePrice, format, { maximumFractionDigits: 0 })})
                    </span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8 justify-start pl-6">
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">Total:</span>
                <span className="text-white text-sm font-semibold">{vaultsTotalCount}</span>
              </div>
              <div className="w-px h-4 bg-[#FFFFFF20]"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">Total TVL:</span>
                <span className="text-[#F9E370] text-sm font-semibold">
                  ${formatNumber(totalTvl, format, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <TableContent
              activeTab={activeTab}
              validatorSubTab={validatorSubTab}
              onValidatorSubTabChange={handleValidatorSubTabChange}
              validatorsData={{
                validators,
                loading: validatorsLoading,
                error: validatorsError
              }}
              vaultsData={{
                vaults,
                loading: vaultsLoading,
                error: vaultsError
              }}
              stakingData={{
                validations: stakingValidations,
                loading: stakingLoading,
                error: stakingError
              }}
              unstakingData={{
                unstakingQueue,
                loading: unstakingLoading,
                error: unstakingError
              }}
              format={format}
              startIndex={activeTab === 'validators' && validatorSubTab === 'all' ? startIndex : 0}
              endIndex={activeTab === 'validators' && validatorSubTab === 'all' ? endIndex : 0}
            />
          </div>
          <div className="mt-4">
            <Pagination
              total={totalItems}
              page={currentPage} // 0-based page for the component
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]} // Normal options
              onPageChange={handlePageChange} // Receives 0-based page
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
