import { Card } from "@/components/ui/card";
import { useValidators } from "@/services/validator";
import { useStakingValidationsPaginated, useUnstakingQueuePaginated } from "@/services/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "../common/pagination";
import { TableContent } from "../explorer/vaultValidatorSum";
import { ValidatorSubTab } from "./types";
import { StakersTable } from "./StakersTable";

interface ValidatorTableProps {
  activeTab: ValidatorSubTab;
}

export function ValidatorTable({ activeTab }: ValidatorTableProps) {
  const validatorSubTab = activeTab;
  const { validators, isLoading: validatorsLoading, error: validatorsError } = useValidators();
  const [currentPage, setCurrentPage] = useState(0);
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
  
  const { format } = useNumberFormat();

  const handleValidatorSubTabChange = useCallback((subTab: ValidatorSubTab) => {
    // Cette fonction n'est plus utilisée car les tabs sont maintenant externes
    setCurrentPage(0);
  }, []);

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
    setCurrentPage(newPage);
    
    if (validatorSubTab === 'transactions') {
      updateStakingParams({ page: newPage + 1 });
    } else if (validatorSubTab === 'unstaking') {
      updateUnstakingParams({ page: newPage + 1 });
    }
  }, [validatorSubTab, updateStakingParams, updateUnstakingParams]);

  // Handle rows per page changes from Pagination component
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    
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
  }, [validatorSubTab, updateStakingParams, updateUnstakingParams]);

  // Calculate pagination for validators (client-side) - only for 'all' tab
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
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
    <div className="w-full">
      <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 flex flex-col rounded-lg">

        
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            {validatorSubTab === 'stakers' ? (
              <StakersTable />
            ) : (
              <TableContent
                activeTab="validators"
                validatorSubTab={validatorSubTab}
                onValidatorSubTabChange={handleValidatorSubTabChange}
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
            <div className="mt-4">
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
      </Card>
    </div>
  );
} 