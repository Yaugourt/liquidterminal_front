import { useTrendingValidators } from "@/services/dashboard/hooks/useTrendingValidators";
import { useLatestAuctions } from "@/services/dashboard/hooks/useLatestAuctions";
import { useVaults } from "@/services/market/vault/hooks/useVaults";
import { TabSectionProps } from "@/components/types/dashboard.types";
import { TabButtons } from "./TabButtons";
import { ValidatorsTable, AuctionsTable, VaultTable } from "./DataTablesContent";

export function TabSection({
  activeTab,
  setActiveTab,
}: TabSectionProps) {
  const { validators, isLoading: validatorsLoading, error: validatorsError } = useTrendingValidators('stake');
  const { auctions, isLoading: auctionsLoading, error: auctionsError } = useLatestAuctions(5);
  const { vaults, isLoading: vaultsLoading, error: vaultsError } = useVaults({
    limit: 5,
    sortBy: 'tvl'
  });

  // Transform vaults data to match VaultTableProps type
  const transformedVaults = vaults.map(vault => ({
    name: vault.summary.name,
    apr: vault.apr * 100, // Convert APR to percentage
    tvl: parseFloat(vault.summary.tvl)
  }));

  return (
    <div className="w-full lg:w-[400px]">
      <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "stacking" && (
        <ValidatorsTable
          validators={validators}
          isLoading={validatorsLoading}
          error={validatorsError}
        />
      )}

      {activeTab === "auction" && (
        <AuctionsTable
          auctions={auctions}
          isLoading={auctionsLoading}
          error={auctionsError}
        />
      )}

      {activeTab === "vault" && (
        <VaultTable
          vaults={transformedVaults}
          isLoading={vaultsLoading}
          error={vaultsError}
        />
      )}
    </div>
  );
}
