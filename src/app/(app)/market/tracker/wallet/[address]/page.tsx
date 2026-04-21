"use client";

import { useParams } from "next/navigation";
import { AddressAnalyticsLayout } from "@/components/address";

/**
 * Trading-dashboard view of a wallet — public, accessible without auth.
 * Focus: trading performance (PortfolioStats + PerformanceChart).
 * Tabs are trade-oriented (holdings, orders, twap, fills).
 * On-chain activity lives on the explorer route.
 */
export default function PublicWalletView() {
  const params = useParams();
  const address = params.address as string;

  return (
    <AddressAnalyticsLayout
      address={address}
      tabs={["holdings", "orders", "twap", "fills"]}
      defaultTab="holdings"
      summaryVariant="tracker"
      titleOverride={`Wallet ${address.slice(0, 6)}...${address.slice(-4)}`}
    />
  );
}
