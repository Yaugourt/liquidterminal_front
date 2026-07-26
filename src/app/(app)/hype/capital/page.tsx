"use client";

import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  AssistanceFundCard,
  BurnCard,
  CapitalReturnedCard,
  GenesisDistributionCard,
  HypeStakingCard,
  SupplyScarcityCard,
} from "@/components/hype";

/**
 * HYPE · Capital — the supply read as a capital structure.
 *
 * Issuance is dilution, the burn is retirement, the Assistance Fund buyback is
 * a repurchase, and staking is the float that is locked rather than trading.
 * Framing them together answers the question the overview cannot: is the token
 * being given away faster than it is being taken back.
 */
export default function HypeCapitalPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <SectionHead
          title="Returns to holders"
          subtitle="What share of revenue comes back as a buyback"
        />
        <CapitalReturnedCard />
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
          title="Buyback &amp; Burn"
          subtitle="Assistance Fund holdings and cost basis · HYPE removed from supply"
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AssistanceFundCard />
          <BurnCard />
        </div>
      </section>

      <section className="space-y-2.5">
        <SectionHead title="Staking" subtitle="HYPE locked in proof-of-stake" />
        <HypeStakingCard />
      </section>
    </div>
  );
}
