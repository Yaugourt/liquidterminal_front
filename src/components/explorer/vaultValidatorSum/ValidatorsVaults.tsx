import { Card } from "@/components/ui/card";
import { useValidators } from "@/services/validator";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useStakingValidationsPaginated, useUnstakingQueuePaginated } from "@/services/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useState, useCallback, useEffect } from "react";
import { Pagination } from "../../common/pagination";
import { TabButtons, TableContent } from ".";

type TabType = 'validators' | 'vaults';
type ValidatorSubTab = 'all' | 'transactions' | 'unstaking';

export function ValidatorsTable() {
  const [activeTab, setActiveTab] = useState<TabType>('validators');
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');
  const { validators, stats, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const [currentPage, setCurrentPage] = useState(0); // 0-based pour le composant common
  const [rowsPerPage, setRowsPerPage] = useState(10); // Start with 25
  
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
      console.log('Syncing staking validations pagination on tab switch');
      updateStakingParams({ 
        page: currentPage + 1,
        limit: rowsPerPage 
      });
    }
  }, [activeTab, validatorSubTab, currentPage, rowsPerPage, updateStakingParams]);

  // Sync hooks pagination when switching to unstaking tab
  useEffect(() => {
    if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
      console.log('Syncing unstaking queue pagination on tab switch');
      updateUnstakingParams({ 
        page: currentPage + 1,
        limit: rowsPerPage 
      });
    }
  }, [activeTab, validatorSubTab, currentPage, rowsPerPage, updateUnstakingParams]);

  // Handle page changes from Pagination component (receives 0-based page)
  const handlePageChange = useCallback((newPage: number) => {
    console.log('handlePageChange called with newPage:', newPage, 'activeTab:', activeTab, 'validatorSubTab:', validatorSubTab);
    setCurrentPage(newPage);
    
    if (activeTab === 'validators' && validatorSubTab === 'transactions') {
      console.log('Updating staking validations page to:', newPage + 1);
      updateStakingParams({ page: newPage + 1 }); // Convert to 1-based for API
    } else if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
      console.log('Updating unstaking queue page to:', newPage + 1);
      updateUnstakingParams({ page: newPage + 1 }); // Convert to 1-based for API
    } else if (activeTab === 'vaults') {
      updateVaultsParams({ page: newPage + 1 }); // Convert to 1-based for API
    }
  }, [activeTab, validatorSubTab, updateStakingParams, updateUnstakingParams, updateVaultsParams]);

  // Handle rows per page changes from Pagination component
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    console.log('handleRowsPerPageChange called with newRowsPerPage:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page
    
    if (activeTab === 'validators' && validatorSubTab === 'transactions') {
      console.log('Updating staking validations limit to:', newRowsPerPage);
      updateStakingParams({ 
        page: 1, // Reset to first page (1-based for API)
        limit: newRowsPerPage 
      });
    } else if (activeTab === 'validators' && validatorSubTab === 'unstaking') {
      console.log('Updating unstaking queue limit to:', newRowsPerPage);
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

  // Get current data based on active tab
  const isLoading = activeTab === 'validators' ? validatorsLoading : vaultsLoading;
  const error = activeTab === 'validators' ? validatorsError : vaultsError;

  // Calculate pagination for validators (client-side) - only for 'all' tab
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const getHeaderInfo = () => {
    if (activeTab === 'validators') {
      return {
        title: 'Validators',
        subtitle: `${stats.active} active of ${stats.total} validators`
      };
    } else {
      return {
        title: 'Vaults',
        subtitle: `${vaultsTotalCount} open vaults`
      };
    }
  };

  const headerInfo = getHeaderInfo();
  
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
                      : 'text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'transactions' ? 'Transactions' : 'Unstaking Queue'}
                </button>
              ))}
            </div>
          )}
          <div className="text-white text-sm">
            {headerInfo.subtitle}
          </div>
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
