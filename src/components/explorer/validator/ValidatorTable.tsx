import { useValidators } from "@/services/explorer/validator";
import { useStakingValidationsPaginated, useUnstakingQueuePaginated } from "@/services/explorer/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useCallback, useEffect } from "react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { TableContent } from "@/components/explorer/vaultValidatorSum";
import { ValidatorSubTab } from "./types";
import { StakersTable } from "./StakersTable";

interface ValidatorTableProps {
  activeTab: ValidatorSubTab;
}

export function ValidatorTable({ activeTab }: ValidatorTableProps) {
  const validatorSubTab = activeTab;
  const { validators, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const {
    page: currentPage,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    startIndex,
    endIndex
  } = usePagination();

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

  const { format } = useNumberFormat();

  // Sync hooks pagination when switching to transactions tab
  useEffect(() => {
    if (validatorSubTab === 'transactions') {
      updateStakingParams({
        page: currentPage + 1,
        limit: rowsPerPage
      });
    }
  }, [validatorSubTab, currentPage, rowsPerPage, updateStakingParams]);

  // Sync hooks pagination when switching to unstaking tab
  useEffect(() => {
    if (validatorSubTab === 'unstaking') {
      updateUnstakingParams({
        page: currentPage + 1,
        limit: rowsPerPage
      });
    }
  }, [validatorSubTab, currentPage, rowsPerPage, updateUnstakingParams]);

  // Handle page changes from Pagination component
  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage);

    if (validatorSubTab === 'transactions') {
      updateStakingParams({ page: newPage + 1 });
    } else if (validatorSubTab === 'unstaking') {
      updateUnstakingParams({ page: newPage + 1 });
    }
  }, [validatorSubTab, updateStakingParams, updateUnstakingParams, onPageChange]);

  // Handle rows per page changes from Pagination component
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    onRowsPerPageChange(newRowsPerPage);

    if (validatorSubTab === 'transactions') {
      updateStakingParams({
        page: 1,
        limit: newRowsPerPage
      });
    } else if (validatorSubTab === 'unstaking') {
      updateUnstakingParams({
        page: 1,
        limit: newRowsPerPage
      });
    }
  }, [validatorSubTab, updateStakingParams, updateUnstakingParams, onRowsPerPageChange]);

  // Calculate total items based on validator sub-tab
  const getTotalItems = () => {
    if (validatorSubTab === 'transactions') {
      return stakingTotal;
    } else if (validatorSubTab === 'unstaking') {
      return unstakingTotal;
    }
    return validators.length;
  };

  const totalItems = getTotalItems();

  return (
    <div className="w-full p-4">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          {validatorSubTab === 'stakers' ? (
            <StakersTable />
          ) : (
            <TableContent
              activeTab="validators"
              validatorSubTab={validatorSubTab}
              onValidatorSubTabChange={() => { }} // No-op function since this component doesn't handle sub-tab changes
              validatorsData={{
                validators,
                loading: validatorsLoading,
                error: validatorsError
              }}
              vaultsData={{
                vaults: [],
                loading: false,
                error: null
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
              startIndex={validatorSubTab === 'all' ? startIndex : 0}
              endIndex={validatorSubTab === 'all' ? endIndex : 0}
            />
          )}
        </div>
        {validatorSubTab !== 'stakers' && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <Pagination
              total={totalItems}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 