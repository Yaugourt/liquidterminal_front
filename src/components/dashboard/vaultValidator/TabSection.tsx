import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useValidators } from "@/services/explorer/validator";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useRecentLiquidations } from "@/services/explorer/liquidation";
import { ValidatorsTable, VaultTable } from "./DataTablesContent";
import { LiquidationsTable } from "./LiquidationsTable";
import type { VaultSummary } from "@/services/explorer/vault/types";
import type { Validator } from "@/services/explorer/validator/types/validators";

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
  const { liquidations, isLoading: liquidationsLoading, error: liquidationsError } = useRecentLiquidations({
    limit: 100
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
  const paginatedLiquidations = liquidations.slice(startIndex, endIndex);

  const getTotalCount = () => {
    switch (activeTab) {
      case 'vault':
        return transformedVaults.length;
      case 'stacking':
        return validators.length;
      case 'liquidations':
        return liquidations.length;
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
      <div className="flex justify-between items-center p-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
            {[
              { key: 'vault', label: 'Vaults' },
              { key: 'stacking', label: 'Validators' },
              { key: 'liquidations', label: 'Liquidations' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                  : 'tab-inactive'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const seeAllLink = activeTab === 'vault' ? '/explorer/vaults' :
            activeTab === 'stacking' ? '/explorer/validator' :
            activeTab === 'liquidations' ? '/explorer/liquidations' : null;

          if (!seeAllLink) return null;

          return (
            <Link
              href={seeAllLink}
              className="flex items-center gap-1 text-label text-text-muted hover:text-brand-accent transition-colors"
            >
              View All
              <ExternalLink size={10} />
            </Link>
          );
        })()}
      </div>

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

        {activeTab === "liquidations" && (
          <LiquidationsTable
            liquidations={paginatedLiquidations}
            isLoading={liquidationsLoading}
            error={liquidationsError}
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

