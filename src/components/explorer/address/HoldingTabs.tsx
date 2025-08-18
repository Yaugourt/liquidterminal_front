"use client";

import { AssetsSection } from "@/components/market/tracker/assets";
import { HoldingTabsProps } from "@/components/types/explorer.types";

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