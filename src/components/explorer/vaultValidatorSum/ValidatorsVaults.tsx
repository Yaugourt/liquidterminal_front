import { useValidators } from "@/services/explorer/validator";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useStakingValidationsPaginated, useUnstakingQueuePaginated } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useState, useCallback, useEffect } from "react";
import { Pagination } from "../../common/pagination";
import { TabButtons, TableContent } from ".";
import { formatNumber } from "@/lib/formatters/numberFormatting";

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
    <div className="w-full h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center p-4 border-b border-border-subtle">
        <TabButtons
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
          {activeTab === 'validators' && (
            <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
              {['all', 'transactions', 'unstaking'].map(tab => (
                <button
                  key={tab}
                  onClick={() => handleValidatorSubTabChange(tab as ValidatorSubTab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${validatorSubTab === tab
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  {tab === 'all' ? 'All' : tab === 'transactions' ? 'Transactions' : 'Unstaking Queue'}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'validators' ? (
            <div className="flex items-center gap-6 max-[720px]:flex-wrap max-[720px]:gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs font-medium">Total:</span>
                <span className="text-white text-sm font-bold">{stats.total}</span>
              </div>
              <div className="w-px h-4 bg-white/10 max-[720px]:hidden"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs font-medium">Active:</span>
                <span className="text-brand-accent text-sm font-bold">{stats.active}</span>
              </div>
              <div className="w-px h-4 bg-white/10 max-[720px]:hidden"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs font-medium">HYPE Staked:</span>
                <div className="flex flex-col">
                  <span className="text-brand-gold text-sm font-bold">
                    {formatNumber(stats.totalHypeStaked, format, { maximumFractionDigits: 0 })}
                  </span>
                  {hypePrice && (
                    <span className="text-text-muted text-xs">
                      (${formatNumber(stats.totalHypeStaked * hypePrice, format, { maximumFractionDigits: 0 })})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 justify-start pl-6 max-[720px]:flex-wrap max-[720px]:gap-4 max-[720px]:pl-0">
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs font-medium">Total:</span>
                <span className="text-white text-sm font-bold">{vaultsTotalCount}</span>
              </div>
              <div className="w-px h-4 bg-white/10 max-[720px]:hidden"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs font-medium">Total TVL:</span>
                <span className="text-brand-gold text-sm font-bold">
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
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <Pagination
              total={totalItems}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
