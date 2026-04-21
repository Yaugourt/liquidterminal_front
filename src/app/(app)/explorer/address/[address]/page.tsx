"use client";

import { useParams } from "next/navigation";
import { AddressAnalyticsLayout } from "@/components/address";

/**
 * Blockchain-explorer view of an address.
 * Focus: on-chain activity (transactions, holdings, vaults, staking).
 * Uses the compact 3-card summary (Overview / PnL / More Info).
 * Trading-oriented visuals live on the tracker route.
 */
export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <AddressAnalyticsLayout
      address={address}
      tabs={["transactions", "holdings", "vaults", "staking"]}
      defaultTab="transactions"
      summaryVariant="explorer"
    />
  );
}
