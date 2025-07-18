import { memo, useMemo, useState } from "react";
import { useValidators } from "@/services/validator";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { TabButtons } from "./TabButtons";
import { ValidatorsTable, VaultTable } from "./DataTablesContent";
import type { VaultSummary } from "@/services/vault/types";
import type { Validator } from "@/services/validator/types/validators";

interface TabSectionComponentProps {
  validators?: Validator[];
  vaults?: VaultSummary[];
}

export const TabSection = memo(({
  validators: initialValidators,
  vaults: initialVaults,
}: TabSectionComponentProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { validators, isLoading: validatorsLoading, error: validatorsError } = useValidators(initialValidators);
  const { vaults, isLoading: vaultsLoading, error: vaultsError } = useVaults({
    limit: 5000,
    sortBy: 'tvl',
    initialData: initialVaults
  });

  // Transform vaults data to match VaultTableProps type
  const transformedVaults = useMemo(() => vaults.map(vault => ({
    name: vault.summary.name,
    apr: vault.apr,
    tvl: parseFloat(vault.summary.tvl),
    vaultAddress: vault.summary.vaultAddress
  })), [vaults]);

  // Reset pagination when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(0);
  };

  // Get paginated data for each tab
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedVaults = transformedVaults.slice(startIndex, endIndex);
  const paginatedValidators = validators.slice(startIndex, endIndex);

  const getTotalCount = () => {
    switch (activeTab) {
      case 'vault':
        return transformedVaults.length;
      case 'stacking':
        return validators.length;
      default:
        return 0;
    }
  };

  const total = getTotalCount();

  const paginationProps = {
    total,
    page: currentPage,
    rowsPerPage,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: setRowsPerPage,
    showPagination: true
  };

  return (
    <div className="w-full">
      <TabButtons activeTab={activeTab} setActiveTab={handleTabChange} />

      <div className="min-h-[300px]">
        {activeTab === "stacking" && (
          <ValidatorsTable
            validators={paginatedValidators}
            isLoading={validatorsLoading && !initialValidators}
            error={validatorsError}
            paginationDisabled={false}
            hidePageNavigation={true}
            {...paginationProps}
          />
        )}



        {activeTab === "vault" && (
          <VaultTable
            vaults={paginatedVaults}
            isLoading={vaultsLoading && !initialVaults}
            error={vaultsError}
            paginationDisabled={false}
            hidePageNavigation={true}
            {...paginationProps}
          />
        )}
      </div>
    </div>
  );
});

TabSection.displayName = 'TabSection';
