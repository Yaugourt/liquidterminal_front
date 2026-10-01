"use client";

import { DataStatus } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  AssistanceFundCard,
  BurnCard,
  BuybackHistoryCard,
  GenesisDistributionCard,
  HypeStakingCard,
  SupplyScarcityCard,
  WhalesVsRetailCard,
} from "@/components/hype";
import { useAfBuybacks } from "@/services/market/hype";

/**
 * HYPE · Capital — the supply read as a capital structure.
 *
 * Issuance is dilution, the burn is retirement, the Assistance Fund buyback is
 * a repurchase, and staking is the float that is locked rather than trading.
 * Framing them together answers the question the overview cannot: is the token
 * being given away faster than it is being taken back.
 */
export default function HypeCapitalPage() {
  // Page-level freshness cue wired to the Assistance Fund buyback fills that
  // lead the page (the "Returns to holders" chart).
  const { dataUpdatedAt, isRefreshing, refetch } = useAfBuybacks();

  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionHead
            title="Returns to holders"
            subtitle="What the fund bought each day against the revenue that funds it"
          />
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        </div>
        <BuybackHistoryCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Supply &amp; Scarcity"
          subtitle="How the 1B genesis HYPE splits today · allocation &amp; vesting"
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SupplyScarcityCard />
          <GenesisDistributionCard />
        </div>
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Buyback, Burn &amp; Holders"
          subtitle="Assistance Fund holdings and cost basis · HYPE removed from supply · whale &amp; retail cohorts"
        />
        {/* Burn and holder concentration stack beside the fund: alone, the burn
            card stretched to the fund's height over a 250px blank, and the
            holder card sat by itself on half a row. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:items-start">
          <AssistanceFundCard />
          <div className="min-w-0 space-y-4">
            <BurnCard />
            <WhalesVsRetailCard />
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <SectionHead title="Staking" subtitle="HYPE locked in proof-of-stake" />
        <HypeStakingCard />
      </section>
    </div>
  );
}
