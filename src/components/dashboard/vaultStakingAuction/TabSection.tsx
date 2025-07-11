import { memo, useMemo, useState } from "react";
import { useLatestAuctions } from "@/services/dashboard";
import { useValidators } from "@/services/validator";
import { AuctionInfo } from "@/services/market/auction";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { TabButtons } from "./TabButtons";
import { ValidatorsTable, AuctionsTable, VaultTable } from "./DataTablesContent";
import type { VaultSummary } from "@/services/vault/types";
import type { Validator } from "@/services/validator/types";

interface TabSectionComponentProps {
  validators?: Validator[];
  auctions?: AuctionInfo[];
  vaults?: VaultSummary[];
}

export const TabSection = memo(({
  validators: initialValidators,
  auctions: initialAuctions,
  vaults: initialVaults,
}: TabSectionComponentProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { validators, isLoading: validatorsLoading, error: validatorsError } = useValidators(initialValidators);
  const { auctions: usdcAuctions, isLoading: usdcLoading, error: usdcError } = useLatestAuctions(undefined, 'USDC', initialAuctions);
  const { auctions: hypeAuctions, isLoading: hypeLoading, error: hypeError } = useLatestAuctions(undefined, 'HYPE');
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

  const allAuctions = useMemo(() => (
    [...(usdcAuctions || []), ...(hypeAuctions || [])]
      .sort((a, b) => b.time - a.time)
  ), [usdcAuctions, hypeAuctions]);

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
  const paginatedAuctions = allAuctions.slice(startIndex, endIndex);

  const getTotalCount = () => {
    switch (activeTab) {
      case 'vault':
        return transformedVaults.length;
      case 'stacking':
        return validators.length;
      case 'auction':
        return allAuctions.length;
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
            {...paginationProps}
          />
        )}

        {activeTab === "auction" && (
          <AuctionsTable
            auctions={paginatedAuctions}
            isLoading={(usdcLoading || hypeLoading) && !initialAuctions}
            error={usdcError || hypeError}
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
