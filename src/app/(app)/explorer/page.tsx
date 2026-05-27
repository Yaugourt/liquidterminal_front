"use client";

import { PageHeader } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  NetworkPulse,
  LiveActivity,
  BridgeTransfers,
  CapitalEvolution,
  TokenDeploys,
  UpcomingUnstaking,
} from "@/components/explorer/v4";
import { VaultsModule } from "@/components/dashboard/modules/VaultsModule";
import { ValidatorsModule } from "@/components/dashboard/modules/ValidatorsModule";
import { BuildersModule } from "@/components/dashboard/modules/BuildersModule";

/**
 * Explorer — V4.2 layout.
 *
 *  1. Network Pulse — split sub-ribbon: HyperCore (L1, 6 cells) +
 *     Cross-Chain Capital (2 cells). EVM-only metrics are intentionally
 *     kept out of the pulse.
 *  2. Live Activity — Latest Blocks + Latest Transactions, both feeding off
 *     the L1 websocket. Pause + paginated (10 rows × 5 pages).
 *  3. Token Deploys — recent deployments full width (replaces the old Bridge
 *     Flow section).
 *  4. Capital Evolution · 30d — donut concentration + bridge TVL trend.
 *  5. Builder Ecosystem & Vaults — top builders alongside top vaults.
 *  6. Validators & Upcoming Unstakings — staking footprint left, biggest
 *     pending unstakings right.
 */
export default function Explorer() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Explorer"
        description="Hyperliquid on-chain explorer — HyperCore (L1) state, cross-chain capital, and live network activity."
      />

      <section className="space-y-2.5">
        <SectionHead
          title="Network Pulse"
          subtitle="HyperCore (L1) heartbeat × cross-chain capital footprint"
        />
        <NetworkPulse />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Live Activity"
          subtitle="Blocks and transactions streamed from the canonical L1 chain"
        />
        <LiveActivity />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Token Deploys & Bridge Transfers"
          subtitle="Latest deployments · USDC bridge in/out (Arbitrum ↔ L1)"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TokenDeploys />
          <BridgeTransfers />
        </div>
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Capital Evolution · 30d"
          subtitle="How the bridged capital base grew over the last month"
        />
        <CapitalEvolution />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Builder Ecosystem & Vaults"
          subtitle="Top builders by fees · top vaults by TVL"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BuildersModule />
          <VaultsModule />
        </div>
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Validators & Unstaking Queue"
          subtitle="HYPE staked · biggest upcoming unstakings"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValidatorsModule />
          <UpcomingUnstaking />
        </div>
      </section>
    </div>
  );
}
