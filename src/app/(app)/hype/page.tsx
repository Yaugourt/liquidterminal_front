"use client";

import { PageHeader } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  HypePricePill,
  HypeHeroRibbon,
  HypePriceChart,
  SupplyScarcityCard,
  GenesisDistributionCard,
  AssistanceFundCard,
  RevenueFlywheelCard,
  BurnCard,
  HypeStakingCard,
} from "@/components/hype";

/**
 * HYPE — everything about Hyperliquid's native asset on one page.
 *
 * Flow (top → bottom):
 *  1. Overview            — live price, market cap / FDV, circulating, AF, lifetime revenue.
 *  2. Supply & Scarcity   — current supply composition + genesis allocation & vesting.
 *  3. Buyback Flywheel     — Assistance Fund holdings, cost basis & buyback per day/week/month.
 *  4. Revenue & Burn      — protocol fees fueling the buyback · HYPE removed from supply.
 *  5. Staking & Security  — HYPE locked in proof-of-stake.
 *
 * All live figures come from the on-chain Hyperliquid info API and the backend
 * revenue endpoint, so the page stays consistent with the rest of the app.
 */
export default function HypePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="HYPE"
        description="The native asset of Hyperliquid — supply and scarcity, the Assistance Fund buyback flywheel, protocol revenue, burn and staking."
        actions={<HypePricePill />}
      />

      {/* 1 — Overview */}
      <section className="space-y-2.5">
        <SectionHead title="Overview" subtitle="Live price, valuation & headline supply" />
        <HypeHeroRibbon />
        <HypePriceChart />
      </section>

      {/* 2 — Supply & Scarcity */}
      <section className="space-y-2.5">
        <SectionHead
          title="Supply &amp; Scarcity"
          subtitle="How the 1B genesis HYPE splits today · allocation & vesting"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SupplyScarcityCard />
          <GenesisDistributionCard />
        </div>
      </section>

      {/* 3 — The Buyback Flywheel */}
      <section className="space-y-2.5">
        <SectionHead
          title="The Buyback Flywheel"
          subtitle="Assistance Fund holdings, cost basis & estimated buyback per day / week / month"
        />
        <AssistanceFundCard />
      </section>

      {/* 4 — Revenue & Burn */}
      <section className="space-y-2.5">
        <SectionHead
          title="Revenue &amp; Burn"
          subtitle="Protocol fees that fund the buyback · HYPE removed from supply"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueFlywheelCard />
          <BurnCard />
        </div>
      </section>

      {/* 5 — Staking & Security */}
      <section className="space-y-2.5">
        <SectionHead title="Staking &amp; Security" subtitle="HYPE locked in proof-of-stake" />
        <HypeStakingCard />
      </section>
    </div>
  );
}
