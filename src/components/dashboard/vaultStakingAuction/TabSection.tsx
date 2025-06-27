import { memo, useMemo, useState } from "react";
import { useTrendingValidators, useLatestAuctions, TrendingValidator } from "@/services/dashboard";
import { AuctionInfo } from "@/services/market/auction";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { TabButtons } from "./TabButtons";
import { ValidatorsTable, AuctionsTable, VaultTable } from "./DataTablesContent";
import type { VaultSummary } from "@/services/vault/types";

interface TabSectionComponentProps {
  validators?: TrendingValidator[];
  auctions?: AuctionInfo[];
  vaults?: VaultSummary[];
}

export const TabSection = memo(({
  validators: initialValidators,
  auctions: initialAuctions,
  vaults: initialVaults,
}: TabSectionComponentProps) => {
  const [activeTab, setActiveTab] = useState("vault");

  const { validators, isLoading: validatorsLoading, error: validatorsError } = useTrendingValidators('stake', initialValidators);
  const { auctions: usdcAuctions, isLoading: usdcLoading, error: usdcError } = useLatestAuctions(5, 'USDC', initialAuctions);
  const { auctions: hypeAuctions, isLoading: hypeLoading, error: hypeError } = useLatestAuctions(5, 'HYPE');
  const { vaults, isLoading: vaultsLoading, error: vaultsError } = useVaults({
    limit: 5,
    sortBy: 'tvl',
    initialData: initialVaults
  });

  // Transform vaults data to match VaultTableProps type
  const transformedVaults = useMemo(() => vaults.map(vault => ({
    name: vault.summary.name,
    apr: vault.apr * 100,
    tvl: parseFloat(vault.summary.tvl)
  })), [vaults]);

  const allAuctions = useMemo(() => (
    [...(usdcAuctions || []), ...(hypeAuctions || [])]
      .sort((a, b) => b.time - a.time)
      .slice(0, 5)
  ), [usdcAuctions, hypeAuctions]);

  return (
    <div className="w-full">
      <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "stacking" && (
        <ValidatorsTable
          validators={validators}
          isLoading={validatorsLoading && !initialValidators}
          error={validatorsError}
        />
      )}

      {activeTab === "auction" && (
        <AuctionsTable
          auctions={allAuctions}
          isLoading={(usdcLoading || hypeLoading) && !initialAuctions}
          error={usdcError || hypeError}
        />
      )}

      {activeTab === "vault" && (
        <VaultTable
          vaults={transformedVaults}
          isLoading={vaultsLoading && !initialVaults}
          error={vaultsError}
        />
      )}
    </div>
  );
});

TabSection.displayName = 'TabSection';
