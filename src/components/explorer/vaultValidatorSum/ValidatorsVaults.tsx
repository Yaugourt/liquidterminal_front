import { Card } from "@/components/ui/card";
import { useValidators } from "@/services/validator";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useStakingValidations } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { useState, useCallback } from "react";
import { Pagination } from "../../common/pagination";
import { TabButtons, TableContent } from ".";

type TabType = 'validators' | 'vaults';
type ValidatorSubTab = 'all' | 'transactions' | 'unstaking';

export function ValidatorsTable() {
  const [activeTab, setActiveTab] = useState<TabType>('validators');
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');
  const { validators, stats, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const { validations: stakingValidations, isLoading: stakingLoading, error: stakingError } = useStakingValidations();
  const [currentPage, setCurrentPage] = useState(0); // 0-based pour le composant common
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // For vaults, use API pagination instead of client-side pagination
  const { vaults, totalTvl, totalCount: vaultsTotalCount, isLoading: vaultsLoading, error: vaultsError } = useVaults({ 
    page: activeTab === 'vaults' ? currentPage + 1 : 1, // API uses 1-based pagination
    limit: activeTab === 'vaults' ? rowsPerPage : 10,
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

  // Get current data based on active tab
  const isLoading = activeTab === 'validators' ? validatorsLoading : vaultsLoading;
  const error = activeTab === 'validators' ? validatorsError : vaultsError;

  // Calculate pagination for validators (client-side)
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
        return stakingValidations?.length || 0;
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
                  onClick={() => setValidatorSubTab(tab as ValidatorSubTab)}
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
              format={format}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
          <div className="mt-4">
            <Pagination
              total={totalItems}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
