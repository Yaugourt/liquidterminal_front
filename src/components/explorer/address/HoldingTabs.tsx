"use client";

import { AssetsSection } from "@/components/wallets/assets/AssetsSection";

interface HoldingTabsProps {
  address: string;
  viewType?: "spot" | "perp";
}

export function HoldingTabs({ address, viewType = "spot" }: HoldingTabsProps) {
  return (
    <div className="mt-6">
      <AssetsSection 
        initialViewType={viewType} 
        addressOverride={address} 
      />
    </div>
  );
} 