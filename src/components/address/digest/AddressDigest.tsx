"use client";

import { AddressKpiRibbon } from "./AddressKpiRibbon";
import { WalletProfileCard } from "./WalletProfileCard";
import { useAddressDigest } from "./useAddressDigest";

interface AddressDigestProps {
  address: string;
}

/**
 * Explorer summary for an address: one KPI ribbon + one wallet-profile card.
 * Opens every feed exactly once (`useAddressDigest`) and hands the derived
 * model to both presentational blocks.
 */
export function AddressDigest({ address }: AddressDigestProps) {
  const model = useAddressDigest(address);
  return (
    <div className="space-y-4">
      <AddressKpiRibbon model={model} />
      <WalletProfileCard model={model} />
    </div>
  );
}
